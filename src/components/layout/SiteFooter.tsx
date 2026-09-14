import { useI18n } from '@/app/providers/i18n';
import { Logo } from '@/components/ui/Logo';

import styles from './SiteFooter.module.scss';

export function SiteFooter() {
  const { m } = useI18n();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.brand}>
            <Logo />
          </p>
          <p className={styles.meta}>{m.footer.tagline}</p>
        </div>

        <nav className={styles.links} aria-label={m.nav.footerLabel}>
          <a className={styles.link} href="#identify">
            {m.nav.identify}
          </a>
          <a className={styles.link} href="#goal">
            {m.nav.goal}
          </a>
          <a className={styles.link} href="#connect">
            {m.nav.connect}
          </a>
        </nav>
      </div>
    </footer>
  );
}
