import { clearActivity, recordActivity } from './idle';

const SESSION_KEY = 'marka-session';

/**
 * Where tokens live.
 *
 * The id token is held in memory only. It never touches storage, so it dies
 * with the tab and cannot be read back by script after a page someone left
 * open all week.
 *
 * The refresh token is not here at all. The API keeps it in an httpOnly cookie
 * that no script on this page can read, and the browser attaches it to
 * /auth/refresh on its own. What is stored instead is a marker that a session
 * was started: not a credential, only enough to know after a reload that a
 * refresh is worth trying, and to tell other tabs when this one signs out.
 */
let idToken: string | null = null;
let accessToken: string | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

/**
 * Keeps other tabs in step. Signing out removes the session marker, which
 * fires a `storage` event in every OTHER tab. Without this those tabs keep a
 * live id token in memory and look signed in for up to an hour after the person
 * pressed sign out.
 */
function handleStorage(event: StorageEvent): void {
  if (event.key !== SESSION_KEY) return;
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

/** Whether a session was started in this browser and has not been ended. */
export function hasSessionMarker(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

export function setTokens(tokens: {
  idToken: string;
  accessToken?: string;
  /** True for a sign-in; a refresh only replaces the tokens. */
  signedIn?: boolean;
}): void {
  idToken = tokens.idToken;
  if (tokens.accessToken) accessToken = tokens.accessToken;

  if (tokens.signedIn) {
    // A sign-in is activity; without this a timestamp left over from days ago
    // would sign the person straight back out.
    recordActivity(Date.now(), { force: true });
    try {
      localStorage.setItem(SESSION_KEY, '1');
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
    localStorage.removeItem(SESSION_KEY);
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
