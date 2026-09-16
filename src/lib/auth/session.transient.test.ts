import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';

import { authorizedRequest, resetSessionStateForTests } from './session';
import { clearTokens, getRefreshToken, setTokens } from './token-store';

const api = (path: string) => `${config.apiUrl}${path}`;

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  // An id token that has already expired, so the next request must refresh.
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() - 10 }), refreshToken: 'refresh-token' });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('a refresh that fails for a reason unrelated to the session', () => {
  it('keeps the session when the network is down', async () => {
    server.use(http.post(api('/auth/refresh'), () => HttpResponse.error()));

    await expect(authorizedRequest('/identifications')).rejects.toThrow();
    expect(getRefreshToken()).toBe('refresh-token');
  });

  it('keeps the session when the API has a server error', async () => {
    server.use(
      http.post(api('/auth/refresh'), () =>
        HttpResponse.json({ success: false, code: 'SERVER_ERROR' }, { status: 500 }),
      ),
    );

    await expect(authorizedRequest('/identifications')).rejects.toThrow();
    expect(getRefreshToken()).toBe('refresh-token');
  });

  it('still ends the session when the refresh token is rejected', async () => {
    server.use(
      http.post(api('/auth/refresh'), () =>
        HttpResponse.json(
          { success: false, code: 'SESSION_EXPIRED', error: 'Session expired' },
          { status: 401 },
        ),
      ),
    );

    await expect(authorizedRequest('/identifications')).rejects.toThrow();
    expect(getRefreshToken()).toBeNull();
  });
});
