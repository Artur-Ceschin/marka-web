import { useSyncExternalStore } from 'react';

import { request } from '../http';

import { clearTokens, getIdToken, getRefreshToken, subscribeTokens } from './token-store';

/**
 * Whether this browser holds a session.
 *
 * True with only a refresh token and no id token, which is the normal state
 * right after a reload: the id token lives in memory and is gone, and the next
 * authenticated request refreshes it. If that refresh fails, the session layer
 * clears everything and this flips to false on its own.
 */
export function hasSession(): boolean {
  return Boolean(getIdToken() ?? getRefreshToken());
}

/** Re-renders when tokens change, including sign-out in another tab. */
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribeTokens, hasSession, () => false);
}

/**
 * Ends the session: locally at once, and at Cognito in the background.
 *
 * The tokens are cleared before the request so the UI never waits on the
 * network to sign someone out. Revoking the refresh token is what stops a
 * copied token from working for its remaining 30 days. If that call fails the
 * browser is still signed out; only the leaked-token protection is lost.
 */
export function signOut(): void {
  const refreshToken = getRefreshToken();
  clearTokens();

  if (refreshToken) {
    void request('/auth/signout', { method: 'POST', body: { refreshToken } }).catch(() => {});
  }
}
