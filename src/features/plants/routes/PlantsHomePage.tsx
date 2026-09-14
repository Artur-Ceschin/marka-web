import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { signOut } from '@/lib/auth/use-auth';

import { useIdentifyCheck } from '../api/queries';

import styles from './PlantsHomePage.module.scss';

/**
 * The first screen after sign-in.
 *
 * Deliberately thin: the catalogue itself does not exist yet. What it does do
 * is make one authenticated call and report the result, so a broken token,
 * refresh or API configuration shows up here instead of on the first real
 * feature built on top of it.
 */
export function PlantsHomePage() {
  const { m } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const check = useIdentifyCheck();

  let statusText = m.app.checking;
  let statusClass: string | undefined;
  if (check.isError) {
    statusText = m.app.connectionFailed;
    statusClass = styles.failed;
  } else if (check.isSuccess) {
    statusText = m.app.connectionOk;
    statusClass = styles.ok;
  }

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Logo />
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

      <main id="main" className={styles.main}>
        <h1 className={styles.title}>{m.app.title}</h1>
        <p className={styles.subtitle}>{m.app.subtitle}</p>
        <p
          className={[styles.status, statusClass].filter(Boolean).join(' ')}
          role="status"
          aria-live="polite"
        >
          <span className={styles.dot} aria-hidden="true" />
          {statusText}
        </p>
      </main>
    </div>
  );
}
