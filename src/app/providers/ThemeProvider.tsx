import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import {
  getInitialTheme,
  THEME_STORAGE_KEY,
  type Theme,
  ThemeContext,
  type ThemeContextValue,
} from './theme';

/**
 * Owns the `data-theme` attribute on <html>, which is the single switch the
 * token layer reads. Nothing else in the app needs to know the theme to render
 * correctly: components reference semantic tokens, and those re-resolve on
 * their own when the attribute changes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    // Keep the browser chrome in step with the page. index.html ships two
    // media-scoped <meta name="theme-color"> tags so the first paint is right
    // before any JS runs, but a manual toggle overrides the media query. Every
    // tag gets the same value, so whichever one the browser is currently
    // matching is correct regardless of the OS preference.
    const chrome = theme === 'dark' ? '#1B2A20' : '#F3F1EA';
    for (const tag of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      tag.content = chrome;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage unavailable: the theme still applies for this session.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
