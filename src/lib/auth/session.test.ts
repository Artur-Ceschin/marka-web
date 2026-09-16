import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';

import { ApiError } from '../api-error';

import {
  authorizedRequest,
  refreshSession,
  resetSessionStateForTests,
  setOnSessionEnded,
} from './session';
import { clearTokens, getIdToken, secondsUntilExpiry, setTokens } from './token-store';

const api = (path: string) => `${config.apiUrl}${path}`;

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('token expiry', () => {
  it('reads seconds remaining from the exp claim', () => {
    const token = makeJwt({ exp: nowInSeconds() + 600 });
    const remaining = secondsUntilExpiry(token);
    expect(remaining).toBeGreaterThan(590);
    expect(remaining).toBeLessThanOrEqual(600);
  });

  it('returns null for a token it cannot decode, rather than throwing', () => {
    // A malformed token must not take the app down: the caller treats null as
    // "cannot tell" and refreshes.
    expect(secondsUntilExpiry('not-a-jwt')).toBeNull();
  });
});

describe('refreshSession', () => {
  it('shares one in-flight request across concurrent callers', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 10 }), signedIn: true });

    let calls = 0;
    server.use(
      http.post(api('/auth/refresh'), async () => {
        calls += 1;
        // Hold the response open so all five callers are waiting at once.
        await new Promise((resolve) => setTimeout(resolve, 30));
        return HttpResponse.json({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }) });
      }),
    );

    const results = await Promise.all([
      refreshSession(),
      refreshSession(),
      refreshSession(),
      refreshSession(),
      refreshSession(),
    ]);

    // Five parallel requests, one refresh. Beyond being wasteful, firing five
    // would be a correctness bug where refresh tokens rotate: the first
    // response invalidates the token the other four are still using.
    expect(calls).toBe(1);
    expect(new Set(results).size).toBe(1);
  });

  it('allows a new refresh after the first settles', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 10 }), signedIn: true });

    let calls = 0;
    server.use(
      http.post(api('/auth/refresh'), () => {
        calls += 1;
        return HttpResponse.json({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }) });
      }),
    );

    await refreshSession();
    await refreshSession();
    // The dedupe must not latch: it deduplicates concurrency, not all future
    // refreshes.
    expect(calls).toBe(2);
  });

  it('ends the session when the refresh token is dead', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 10 }), signedIn: true });
    server.use(
      http.post(api('/auth/refresh'), () =>
        HttpResponse.json({ code: 'SESSION_EXPIRED' }, { status: 401 }),
      ),
    );
    const onEnded = vi.fn();
    setOnSessionEnded(onEnded);

    await expect(refreshSession()).rejects.toBeInstanceOf(ApiError);

    // 401 SESSION_EXPIRED is terminal: nothing is left to retry with, so the
    // tokens go and the app routes to sign-in.
    expect(onEnded).toHaveBeenCalledOnce();
    expect(getIdToken()).toBeNull();
  });
});

describe('authorizedRequest', () => {
  it('refreshes before sending when the token is near expiry', async () => {
    // Inside the 60s skew window: valid right now, but likely expired by the
    // time the server reads it.
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 5 }), signedIn: true });

    let refreshes = 0;
    server.use(
      http.post(api('/auth/refresh'), () => {
        refreshes += 1;
        return HttpResponse.json({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }) });
      }),
    );

    await authorizedRequest('/identifications');
    expect(refreshes).toBe(1);
  });

  it('does not refresh a token with plenty of life left', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });

    let refreshes = 0;
    server.use(
      http.post(api('/auth/refresh'), () => {
        refreshes += 1;
        return HttpResponse.json({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }) });
      }),
    );

    await authorizedRequest('/identifications');
    expect(refreshes).toBe(0);
  });

  it('retries once after a 401, and only once', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });

    let attempts = 0;
    server.use(
      http.get(api('/identifications'), () => {
        attempts += 1;
        // Always 401, so a retry loop would show up as runaway attempts.
        return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
      }),
      http.post(api('/auth/refresh'), () =>
        HttpResponse.json({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }) }),
      ),
    );

    await expect(authorizedRequest('/identifications')).rejects.toBeInstanceOf(ApiError);
    expect(attempts).toBe(2);
  });

  it('succeeds on the retry when the second attempt is accepted', async () => {
    setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });

    let attempts = 0;
    server.use(
      http.get(api('/identifications'), () => {
        attempts += 1;
        if (attempts === 1) return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
        return HttpResponse.json({ ok: true });
      }),
      http.post(api('/auth/refresh'), () =>
        HttpResponse.json({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }) }),
      ),
    );

    await expect(authorizedRequest('/identifications')).resolves.toBeUndefined();
    expect(attempts).toBe(2);
  });

  it('sends the bearer token', async () => {
    const idToken = makeJwt({ exp: nowInSeconds() + 3600 });
    setTokens({ idToken, signedIn: true });

    let seen: string | null = null;
    server.use(
      http.get(api('/identifications'), ({ request }) => {
        seen = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      }),
    );

    await authorizedRequest('/identifications');
    expect(seen).toBe(`Bearer ${idToken}`);
  });
});
