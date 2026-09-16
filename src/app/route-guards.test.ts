import { isRedirect } from '@tanstack/react-router';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, getIdToken, hasSessionMarker, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';

import { redirectIfSignedIn, requireSession } from './route-guards';

const api = (path: string) => `${config.apiUrl}${path}`;

/** Runs a guard and reports what it decided. */
async function outcome(guard: () => Promise<void>): Promise<string> {
  try {
    await guard();
    return 'allowed';
  } catch (error) {
    if (isRedirect(error)) {
      return `redirect:${String((error as { options: { to?: string } }).options.to)}`;
    }
    throw error;
  }
}

let refreshCalls = 0;
// The refresh token is an httpOnly cookie the page never sees, so only the API
// knows whether the session is dead. This flag stands in for that answer.
let sessionIsDead = false;

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  refreshCalls = 0;
  sessionIsDead = false;
  server.use(
    http.post(api('/auth/refresh'), () => {
      refreshCalls += 1;
      if (sessionIsDead) {
        return HttpResponse.json({ code: 'SESSION_EXPIRED' }, { status: 401 });
      }
      return HttpResponse.json({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }) });
    }),
  );
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('route guards', () => {
  it('sends a visitor with no session to sign-in', async () => {
    expect(await outcome(requireSession)).toBe('redirect:/sign-in');
    expect(await outcome(redirectIfSignedIn)).toBe('allowed');
  });

  it('lets a valid session straight through without a network call', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });

    expect(await outcome(requireSession)).toBe('allowed');
    expect(await outcome(redirectIfSignedIn)).toBe('redirect:/app');
    expect(refreshCalls).toBe(0);
  });

  it('refreshes an expired session before deciding, rather than after rendering', async () => {
    // The state after a reload: id token gone from memory, refresh cookie kept.
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 60 }), signedIn: true });

    expect(await outcome(requireSession)).toBe('allowed');
    expect(refreshCalls).toBe(1);
    expect(getIdToken()).not.toBeNull();
  });

  it('redirects a dead session to sign-in without ever rendering the app', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 60 }), signedIn: true });
    sessionIsDead = true;

    expect(await outcome(requireSession)).toBe('redirect:/sign-in');
    expect(hasSessionMarker()).toBe(false);
  });

  it('does not bounce a dead session from sign-in through the app', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 60 }), signedIn: true });
    sessionIsDead = true;

    // Previously this redirected to /app on the mere presence of a token, then
    // bounced back once the refresh failed.
    expect(await outcome(redirectIfSignedIn)).toBe('allowed');
  });

  it('keeps an offline visitor signed in rather than logging them out', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 60 }), signedIn: true });
    server.use(http.post(api('/auth/refresh'), () => HttpResponse.error()));

    // A network failure says nothing about the session, so it stays and the app
    // is allowed to load and report the connection problem.
    expect(await outcome(requireSession)).toBe('allowed');
    expect(hasSessionMarker()).toBe(true);
    expect(await outcome(redirectIfSignedIn)).toBe('allowed');
  });
});
