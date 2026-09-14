import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { getInitialLocale, LOCALE_STORAGE_KEY, type Locale, MESSAGES } from '@/lib/i18n';

import { I18nContext, type I18nContextValue } from './i18n';

/**
 * Owns the active locale.
 *
 * Also keeps `<html lang>` in step, which is not cosmetic: it is what tells a
 * screen reader which voice and pronunciation rules to use, and what lets the
 * browser hyphenate and spellcheck correctly. A Portuguese page announced by an
 * English voice is close to unusable.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Storage unavailable; the choice still applies for this session.
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, m: MESSAGES[locale] }),
    [locale, setLocale],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}
