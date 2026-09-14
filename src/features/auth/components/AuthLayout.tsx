import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useI18n } from '@/app/providers/i18n';

import { images } from '@/assets/images';
import { Logo } from '@/components/ui/Logo';
import { Picture } from '@/components/ui/Picture';

import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  title: string;
  /** Omit where the page supplies its own lead-in. */
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { m } = useI18n();

  return (
    <div className={styles.page}>
      <div className={styles.formColumn}>
        <Link to="/" className={styles.brand}>
          <Logo />
        </Link>

        <main className={styles.body}>
          <div className={styles.inner}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            {children}
          </div>
        </main>

        <p className={styles.footer}>{footer}</p>
      </div>

      {/* Decorative: the page reads identically without it, so it is hidden
          from assistive tech and dropped entirely below 960px rather than
          costing a phone an image download for nothing. */}
      <div className={styles.media} aria-hidden="true">
        <Picture image={images.forest} sizes="(min-width: 960px) 54vw, 100vw" priority />
        <div className={styles.mediaScrim} />
        <div className={styles.quote}>
          <p className={styles.quoteText}>{m.auth.quote}</p>
          <p className={styles.quoteMeta}>{m.auth.quoteMeta}</p>
        </div>
      </div>
    </div>
  );
}
