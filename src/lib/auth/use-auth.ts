import { useSyncExternalStore } from 'react';

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
 * Ends the session in this browser.
 *
 * Local only: the API has no sign-out endpoint, so the refresh token is dropped
 * here but stays valid at Cognito until it expires. Revoking it everywhere
 * would need a server call.
 */
export function signOut(): void {
  clearTokens();
}
