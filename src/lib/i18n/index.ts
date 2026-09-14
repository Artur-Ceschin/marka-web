import { en } from './en';
import { ptBR } from './pt-BR';

export type { Messages } from './en';

/** BCP 47 tags, used verbatim for `<html lang>` and every `Intl.*` call. */
export const LOCALES = ['en', 'pt-BR'] as const;
export type Locale = (typeof LOCALES)[number];

export const MESSAGES: Record<Locale, typeof en> = {
  en,
  'pt-BR': ptBR,
};

/** Shown on the toggle itself, so each option reads in its own language. */
export const LOCALE_LABELS: Record<Locale, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  'pt-BR': { short: 'PT', full: 'Português' },
};

export const LOCALE_STORAGE_KEY = 'marka-locale';

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * An explicit past choice wins; otherwise the browser's preference.
 *
 * `navigator.languages` rather than a single value, and matched on the language
 * subtag, so `pt`, `pt-PT` and `pt-BR` all land on Portuguese. Guidance is to
 * detect from the client's stated languages, never from IP geolocation: someone
 * in Brazil may well want English, and someone abroad may want Portuguese.
 */
export function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    // Storage unavailable; fall through to the browser preference.
  }

  const preferred = typeof navigator === 'undefined' ? [] : (navigator.languages ?? []);
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0];
    if (base === 'pt') return 'pt-BR';
    if (base === 'en') return 'en';
  }
  return 'en';
}
