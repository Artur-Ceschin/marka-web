import { clearActivity, recordActivity } from './idle';

const REFRESH_TOKEN_KEY = 'marka-refresh-token';

/**
 * Where tokens live.
 *
 * The id token is held in memory only. It never touches storage, so it dies
 * with the tab and cannot be read back by script after a page someone left
 * open all week.
 *
 * The refresh token does go to `localStorage`, because without it every reload
 * would mean signing in again. That is the standard trade for an SPA whose API
 * returns tokens in a JSON body: there is no way to set an httpOnly cookie from
 * here, so the refresh token is reachable by any script that runs on this
 * origin. If the API later sets the refresh token as an httpOnly, SameSite
 * cookie, this file is the only thing that has to change.
 */
let idToken: string | null = null;
let accessToken: string | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

/**
 * Keeps other tabs in step. Signing out removes the refresh token from
 * localStorage, which fires a `storage` event in every OTHER tab. Without this
 * those tabs keep a live id token in memory and look signed in for up to an
 * hour after the person pressed sign out.
 */
function handleStorage(event: StorageEvent): void {
  if (event.key !== REFRESH_TOKEN_KEY) return;
  if (event.newValue === null) {
    idToken = null;
    accessToken = null;
  }
  notify();
}

/** Subscribe to token changes. Returns the unsubscribe function. */
export function subscribeTokens(listener: Listener): () => void {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function getIdToken(): string | null {
  return idToken;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(tokens: {
  idToken: string;
  accessToken?: string;
  refreshToken?: string;
}): void {
  idToken = tokens.idToken;
  if (tokens.accessToken) accessToken = tokens.accessToken;

  // A refresh response returns a new id token but usually no new refresh
  // token, so only overwrite when one actually arrives.
  if (tokens.refreshToken) {
    // A sign-in is activity; without this a timestamp left over from days ago
    // would sign the person straight back out.
    recordActivity(Date.now(), { force: true });
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch {
      // Storage unavailable: the session still works until the tab closes.
    }
  }
  notify();
}

export function clearTokens(): void {
  clearActivity();
  idToken = null;
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
  notify();
}

/**
 * Seconds until the token expires, read from the `exp` claim.
 *
 * The payload is decoded, NOT verified. Verification is the API's job and
 * cannot be done here without the signing key. This is only used to decide
 * when to refresh, so a forged token would simply cause an early refresh that
 * the server then rejects.
 */
export function secondsUntilExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp - Math.floor(Date.now() / 1000);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segment = token.split('.')[1];
  if (!segment) return null;
  try {
    // JWTs use base64url: `-` and `_` instead of `+` and `/`, and no padding.
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
