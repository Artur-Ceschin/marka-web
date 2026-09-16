import { z } from 'zod';

import { ApiError } from '../api-error';
import { type RequestOptions, request } from '../http';

import {
  clearTokens,
  getIdToken,
  getRefreshToken,
  secondsUntilExpiry,
  setTokens,
} from './token-store';

const refreshResponseSchema = z.object({
  idToken: z.string(),
  accessToken: z.string().optional(),
  expiresIn: z.number().optional(),
});

/**
 * Refresh this far before the token actually expires.
 *
 * Not zero: a request that leaves with 2 seconds of validity left can still
 * arrive expired after network latency and any clock skew between this device
 * and AWS.
 */
const REFRESH_SKEW_SECONDS = 60;

/**
 * The single in-flight refresh.
 *
 * Without this, five parallel requests that all see an expired token fire five
 * refreshes. Beyond being wasteful, that is a correctness problem where refresh
 * tokens rotate: the first response invalidates the token the other four are
 * still using, and four of the five fail. Everyone awaits the same promise
 * instead.
 */
let inFlightRefresh: Promise<string> | null = null;

/** Called when the session is unrecoverable, so the app can route to sign-in. */
type SessionEndedHandler = () => void;
let onSessionEnded: SessionEndedHandler | null = null;

export function setOnSessionEnded(handler: SessionEndedHandler | null): void {
  onSessionEnded = handler;
}

function endSession(): void {
  clearTokens();
  inFlightRefresh = null;
  onSessionEnded?.();
}

export async function refreshSession(): Promise<string> {
  // Join the refresh already running rather than starting another.
  if (inFlightRefresh) return inFlightRefresh;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    endSession();
    throw new ApiError(401, { code: 'SESSION_EXPIRED' }, 'No refresh token');
  }

  inFlightRefresh = (async () => {
    try {
      const result = await request('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        schema: refreshResponseSchema,
      });
      setTokens(result);
      return result.idToken;
    } catch (error) {
      // A dead refresh token is terminal: there is nothing left to retry with.
      if (error instanceof ApiError && (error.isSessionExpired || error.status === 401)) {
        endSession();
      }
      throw error;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

/** A valid id token, refreshing first if the current one is close to expiring. */
export async function getValidIdToken(): Promise<string | null> {
  const current = getIdToken();

  if (current) {
    const remaining = secondsUntilExpiry(current);
    if (remaining === null || remaining > REFRESH_SKEW_SECONDS) return current;
  }

  if (!getRefreshToken()) return null;

  try {
    return await refreshSession();
  } catch {
    return null;
  }
}

/**
 * An authenticated request, with both halves of the refresh strategy.
 *
 * Proactive: refresh before sending if the token is within the skew window.
 * Reactive: on a 401, refresh once and retry, because the token can expire in
 * the gap between the check and the server reading it, and because another tab
 * may have invalidated it.
 *
 * The retry happens at most once. A second 401 after a fresh token means the
 * problem is not expiry.
 */
export async function authorizedRequest<TResponse>(
  path: string,
  options: Omit<RequestOptions<TResponse>, 'token'> = {},
): Promise<TResponse> {
  const token = await currentOrRefreshedIdToken();

  try {
    return await request<TResponse>(path, { ...options, token });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    const retried = await refreshSession();
    return request<TResponse>(path, { ...options, token: retried });
  }
}

/** Test seam: reset module state between cases. */
export function resetSessionStateForTests(): void {
  inFlightRefresh = null;
  onSessionEnded = null;
}

/**
 * The id token, refreshed first when it is missing or about to expire.
 *
 * Unlike `getValidIdToken` this lets a failed refresh THROW. That difference
 * is the whole point: a refresh that fails because the laptop just woke up
 * with no network, or the API had a 5xx, says nothing about the session, and
 * must not sign anyone out. `refreshSession` ends the session itself, and only
 * when there is no refresh token or the API rejects it with a 401.
 */
async function currentOrRefreshedIdToken(): Promise<string> {
  const current = getIdToken();
  if (current) {
    const remaining = secondsUntilExpiry(current);
    if (remaining === null || remaining > REFRESH_SKEW_SECONDS) return current;
  }
  return refreshSession();
}
