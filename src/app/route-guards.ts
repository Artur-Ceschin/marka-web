import { redirect } from '@tanstack/react-router';

import { setSignInHandoff } from '@/features/auth/sign-in-handoff';
import { isIdleExpired } from '@/lib/auth/idle';
import { getValidIdToken } from '@/lib/auth/session';
import { hasSession, signOut } from '@/lib/auth/use-auth';

type SessionState = 'valid' | 'none' | 'unreachable';

async function resolveSession(): Promise<SessionState> {
  if (!hasSession()) return 'none';
  // Reopening the app after a long gap: no timer ran while it was closed, so
  // the idle limit is checked here, before any page shows.
  if (isIdleExpired()) {
    signOut();
    setSignInHandoff({ email: '', notice: 'idle' });
    return 'none';
  }
  const token = await getValidIdToken();
  if (token) return 'valid';
  return hasSession() ? 'unreachable' : 'none';
}

/**
 * For routes that need a session. Offline visitors with a session still get in:
 * the page reports the connection problem itself, which beats a sign-in form
 * that cannot work either.
 */
export async function requireSession(): Promise<void> {
  if ((await resolveSession()) === 'none') {
    throw redirect({ to: '/sign-in' });
  }
}

/** For sign-in and sign-up. Only a session proven valid skips them. */
export async function redirectIfSignedIn(): Promise<void> {
  if ((await resolveSession()) === 'valid') {
    throw redirect({ to: '/app' });
  }
}
