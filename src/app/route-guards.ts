import { redirect } from '@tanstack/react-router';

import { getValidIdToken } from '@/lib/auth/session';
import { hasSession } from '@/lib/auth/use-auth';

type SessionState = 'valid' | 'none' | 'unreachable';

async function resolveSession(): Promise<SessionState> {
  if (!hasSession()) return 'none';
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
