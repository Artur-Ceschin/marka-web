import { describe, expect, it } from 'vitest';

import { en } from './en';
import { LOCALE_LABELS, LOCALES, MESSAGES } from './index';
import { ptBR } from './pt-BR';

/** Walks the catalogue and returns every leaf path, e.g. "auth.emailLabel". */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafAt(tree: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], tree);
}

describe('message catalogues', () => {
  it('has the same key set in every locale', () => {
    // TypeScript already enforces this at build time. The runtime check exists
    // because `as Messages` casts and structural quirks can slip past it, and a
    // missing key would then surface as `undefined` rendered on the page.
    const expected = leafPaths(en).sort();
    for (const locale of LOCALES) {
      expect(leafPaths(MESSAGES[locale]).sort(), `${locale} key set`).toEqual(expected);
    }
  });

  it('leaves no message empty, and keeps interpolation signatures aligned', () => {
    for (const path of leafPaths(en)) {
      const source = leafAt(en, path);
      const target = leafAt(ptBR, path);

      if (typeof source === 'function') {
        // Messages taking a value are functions. Both locales must accept the
        // same arguments, or a call site that typechecks in English blows up
        // in Portuguese.
        expect(typeof target, `pt-BR ${path} should also be a function`).toBe('function');
        expect((target as (...args: never[]) => string).length, `pt-BR ${path} arity`).toBe(
          (source as (...args: never[]) => string).length,
        );
        continue;
      }

      expect(typeof target, `pt-BR ${path} type`).toBe('string');
      expect((target as string).trim(), `pt-BR ${path} is empty`).not.toBe('');
    }
  });

  it('actually translates the copy rather than copying English', () => {
    // Proper nouns and one deliberately-English a11y label are the exceptions:
    // "Switch to English" must read in English for someone who cannot read the
    // current language.
    const allowedIdentical = new Set(['a11y.switchToEnglish', 'a11y.switchToPortuguese']);

    const identical = leafPaths(en).filter(
      (path) =>
        typeof leafAt(en, path) === 'string' &&
        leafAt(en, path) === leafAt(ptBR, path) &&
        !allowedIdentical.has(path),
    );
    expect(identical, 'these pt-BR strings are still the English text').toEqual([]);
  });

  it('uses BCP 47 tags, which Intl and <html lang> both require', () => {
    for (const locale of LOCALES) {
      expect(() => new Intl.DateTimeFormat(locale)).not.toThrow();
      expect(LOCALE_LABELS[locale].short).toMatch(/^[A-Z]{2}$/);
    }
  });
});
