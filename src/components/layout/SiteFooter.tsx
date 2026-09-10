import { Leaf } from 'lucide-react';

import styles from './SiteFooter.module.scss';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.brand}>
            <Leaf className={styles.brandIcon} aria-hidden="true" />
            <span translate="no">Marka</span>
          </p>
          <p className={styles.meta}>A catalogue of what grows around you.</p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          <a className={styles.link} href="#identify">
            What it identifies
          </a>
          <a className={styles.link} href="#goal">
            Our goal
          </a>
          <a className={styles.link} href="#connect">
            Connections
          </a>
        </nav>
      </div>
    </footer>
  );
}
