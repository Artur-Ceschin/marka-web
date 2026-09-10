import { Leaf } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import styles from './SiteHeader.module.scss';

const NAV_LINKS = [
  { href: '#identify', label: 'What it identifies' },
  { href: '#goal', label: 'Our goal' },
  { href: '#connect', label: 'Connections' },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // An IntersectionObserver on a zero-height sentinel rather than a scroll
    // listener: the callback fires only when the state actually changes, off
    // the main thread, so there is nothing to throttle.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry?.isIntersecting);
      },
      { rootMargin: '0px' },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
        <a href="#main" className={styles.skipLink}>
          Skip to content
        </a>
        <div className={styles.inner}>
          <a href="/" className={styles.brand}>
            <Leaf className={styles.brandIcon} aria-hidden="true" />
            <span translate="no">Marka</span>
          </a>

          <nav className={styles.nav} aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <ThemeToggle />
            <Button asChild size="sm" className={styles.cta}>
              <a href="#start">Get started</a>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
