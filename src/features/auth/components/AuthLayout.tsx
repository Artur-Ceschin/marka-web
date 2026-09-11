import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { images } from '@/assets/images';
import { Logo } from '@/components/ui/Logo';
import { Picture } from '@/components/ui/Picture';

import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.formColumn}>
        <Link to="/" className={styles.brand}>
          <Logo />
        </Link>

        <main className={styles.body}>
          <div className={styles.inner}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            {children}
          </div>
        </main>

        <p className={styles.footer}>{footer}</p>
      </div>

      {/* Decorative: the page reads identically without it, so it is hidden
          from assistive tech and dropped entirely below 960px rather than
          costing a phone an image download for nothing. */}
      <div className={styles.media} aria-hidden="true">
        <Picture image={images.forest} sizes="54vw" />
        <div className={styles.mediaScrim} />
        <div className={styles.quote}>
          <p className={styles.quoteText}>
            Every plant you record is one more thing known about where you live.
          </p>
          <p className={styles.quoteMeta}>Flowers, fungi and trees</p>
        </div>
      </div>
    </div>
  );
}
