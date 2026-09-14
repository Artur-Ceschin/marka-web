import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useIsAuthenticated } from '@/lib/auth/use-auth';

import styles from './SiteHeader.module.scss';

export function SiteHeader() {
  const { m } = useI18n();
  const authenticated = useIsAuthenticated();
  const navLinks = [
    { href: '#identify', label: m.nav.identify },
    { href: '#goal', label: m.nav.goal },
    { href: '#connect', label: m.nav.connect },
  ];
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
          {m.common.skipToContent}
        </a>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand}>
            <Logo />
          </Link>

          <nav className={styles.nav} aria-label={m.nav.primaryLabel}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild size="sm" className={styles.cta}>
              {authenticated ? (
                <Link to="/app">{m.app.openCatalogue}</Link>
              ) : (
                <Link to="/sign-up">{m.common.getStarted}</Link>
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
