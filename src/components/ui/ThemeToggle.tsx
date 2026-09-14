import { Moon, Sun } from 'lucide-react';
import { useI18n } from '@/app/providers/i18n';
import { useTheme } from '@/app/providers/theme';

import styles from './ThemeToggle.module.scss';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { m } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[styles.toggle, className].filter(Boolean).join(' ')}
      // The icon alone carries no accessible name, so the control needs one.
      // It names the ACTION, not the current state: "Switch to dark theme"
      // rather than "Light theme", which would be ambiguous when announced.
      aria-label={theme === 'light' ? m.a11y.switchToDark : m.a11y.switchToLight}
    >
      {theme === 'light' ? (
        <Moon className={styles.icon} aria-hidden="true" />
      ) : (
        <Sun className={styles.icon} aria-hidden="true" />
      )}
    </button>
  );
}
