import { createContext, use } from 'react';

import type { Locale, Messages } from '@/lib/i18n';

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /**
   * The message tree for the active locale.
   *
   * Exposed as an object rather than a `t('some.key')` lookup on purpose: the
   * keys are then real property accesses, so they autocomplete, a typo is a
   * compile error, and there is no runtime path parsing at all.
   */
  m: Messages;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = use(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
