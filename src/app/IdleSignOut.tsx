import { useEffect, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { IDLE_WARNING_MS, msUntilIdle, recordActivity } from '@/lib/auth/idle';
import { signOut } from '@/lib/auth/use-auth';

import styles from './IdleSignOut.module.scss';

const ACTIVITY_EVENTS = [
  'pointerdown',
  'pointermove',
  'keydown',
  'wheel',
  'touchstart',
  'scroll',
] as const;

/**
 * Signs out after 30 minutes without activity, with a one-minute warning.
 *
 * Checked every second against the shared timestamp rather than one long
 * timer: timers pause while a laptop sleeps, and activity in another tab
 * must count here too. On wake the first check simply sees the time passed.
 */
export function IdleSignOut({ onSignedOut }: { onSignedOut: () => void }) {
  const { m } = useI18n();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const onActivity = () => {
      recordActivity();
    };
    const options = { passive: true, capture: true };
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, onActivity, options);

    let done = false;
    const check = () => {
      if (done) return;
      const remaining = msUntilIdle();
      if (remaining <= 0) {
        done = true;
        signOut();
        onSignedOut();
        return;
      }
      setSecondsLeft(remaining <= IDLE_WARNING_MS ? Math.ceil(remaining / 1000) : null);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };

    check();
    const interval = window.setInterval(check, 1000);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity, options);
      }
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onSignedOut]);

  if (secondsLeft === null) return null;

  const stay = () => {
    recordActivity(Date.now(), { force: true });
    setSecondsLeft(null);
  };

  return (
    <Dialog
      open
      role="alertdialog"
      title={m.idle.title}
      description={m.idle.body(secondsLeft)}
      onClose={stay}
    >
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => {
            signOut();
            onSignedOut();
          }}
        >
          {m.idle.signOut}
        </Button>
        <Button onClick={stay}>{m.idle.stay}</Button>
      </div>
    </Dialog>
  );
}
