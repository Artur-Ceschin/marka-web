import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { signOut } from '@/lib/auth/use-auth';

import styles from './AppBar.module.scss';

/** The bar every signed-in page shares: logo, the two views, and the controls. */
export function AppBar() {
  const { m } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <Logo />
        {/* `activeProps` marks the current page for sight and for assistive
            tech; the router sets it from the URL, so it cannot drift. */}
        <nav className={styles.nav} aria-label={m.app.navLabel}>
          <Link
            to="/app"
            className={styles.navLink}
            activeProps={{ className: styles.navActive, 'aria-current': 'page' }}
          >
            {m.app.catalogueNav}
          </Link>
          <Link
            to="/journal"
            className={styles.navLink}
            activeProps={{ className: styles.navActive, 'aria-current': 'page' }}
          >
            {m.app.journalNav}
          </Link>
          <Link
            to="/profile"
            className={styles.navLink}
            activeProps={{ className: styles.navActive, 'aria-current': 'page' }}
          >
            {m.app.profileNav}
          </Link>
        </nav>
      </div>

      <div className={styles.actions}>
        <LanguageToggle />
        <ThemeToggle />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            signOut();
            // Cached responses belong to the account that fetched them and
            // must not be shown to whoever signs in next on this device.
            queryClient.clear();
            void navigate({ to: '/' });
          }}
        >
          {m.app.signOut}
        </Button>
      </div>
    </header>
  );
}
