import { useI18n } from '@/app/providers/i18n';

import { LogoMark } from './Logo';
import styles from './PageLoader.module.scss';

/**
 * Full-page pending state, shown while a route settles (for instance while a
 * session refresh runs before a protected page is allowed to render).
 *
 * The mark is decoration; the status text is what a screen reader hears. It is
 * visually hidden because on a quick connection this screen lasts a fraction of
 * a second, and a word flashing past reads as a glitch.
 */
export function PageLoader() {
  const { m } = useI18n();

  return (
    <div className={styles.page}>
      <LogoMark className={styles.mark} />
      <p className="sr-only" role="status" aria-live="polite">
        {m.common.loading}
      </p>
    </div>
  );
}
