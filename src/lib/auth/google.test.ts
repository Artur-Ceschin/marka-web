import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { config } from '@/lib/config';
import { server } from '@/mocks/server';

import { completeGoogleSignIn } from './google';
import { storePkce } from './pkce';
import { clearTokens, getIdToken, hasSessionMarker } from './token-store';

const api = (path: string) => `${config.apiUrl}${path}`;
const VERIFIER = 'v'.repeat(43);

beforeEach(() => {
  clearTokens();
  sessionStorage.clear();
});

afterEach(() => {
  clearTokens();
});

describe('completeGoogleSignIn', () => {
  it('hands the code to the API, which keeps the refresh token as a cookie', async () => {
    let body: unknown;
    server.use(
      http.post(api('/auth/google'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ idToken: 'id-token', accessToken: 'access', expiresIn: 3600 });
      }),
    );
    storePkce(VERIFIER, 'state-123');

    await completeGoogleSignIn('?code=auth-code&state=state-123');

    expect(body).toEqual({
      code: 'auth-code',
      codeVerifier: VERIFIER,
      redirectUri: config.cognito.redirectUri,
    });
    expect(getIdToken()).toBe('id-token');
    expect(hasSessionMarker()).toBe(true);
  });

  it('refuses a forged callback before the code reaches the API', async () => {
    let called = false;
    server.use(
      http.post(api('/auth/google'), () => {
        called = true;
        return HttpResponse.json({});
      }),
    );
    storePkce(VERIFIER, 'state-123');

    await expect(completeGoogleSignIn('?code=auth-code&state=forged')).rejects.toThrow();
    expect(called).toBe(false);
  });
});
