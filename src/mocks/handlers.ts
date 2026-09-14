import { HttpResponse, http } from 'msw';

import { config } from '@/lib/config';

const api = (path: string) => `${config.apiUrl}${path}`;

/**
 * Default handlers, modelled on the documented contract.
 *
 * Deliberately shaped like the real API rather than like whatever the tests
 * find convenient: the status codes, the `details: [{ field, message }]` body
 * and the error codes are the parts the UI branches on, so getting them right
 * here is what makes the tests meaningful.
 */
export const handlers = [
  http.post(api('/auth/signup'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'taken@example.com') {
      return HttpResponse.json(
        { code: 'EMAIL_EXISTS', message: 'Email already exists' },
        { status: 409 },
      );
    }
    if (body.password === 'Breached123') {
      return HttpResponse.json(
        {
          code: 'VALIDATION',
          details: [
            { field: 'password', message: 'That password has appeared in a known data breach.' },
          ],
        },
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 201 });
  }),

  http.post(api('/auth/confirm'), async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };
    if (body.code !== '123456') {
      return HttpResponse.json(
        { code: 'CODE_MISMATCH', message: 'Invalid verification code.' },
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(api('/auth/resend-code'), () => new HttpResponse(null, { status: 200 })),

  http.post(api('/auth/signin'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'unconfirmed@example.com') {
      return HttpResponse.json(
        { code: 'USER_NOT_CONFIRMED', message: 'User is not confirmed.' },
        { status: 403 },
      );
    }
    if (body.password === 'wrongpassword') {
      return HttpResponse.json(
        { code: 'NOT_AUTHORIZED', message: 'Incorrect email or password.' },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      idToken: makeJwt({ exp: nowInSeconds() + 3600 }),
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
    });
  }),

  http.post(api('/auth/refresh'), async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };
    if (body.refreshToken === 'dead-token') {
      return HttpResponse.json(
        { code: 'SESSION_EXPIRED', message: 'Refresh token is no longer valid.' },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      idToken: makeJwt({ exp: nowInSeconds() + 3600 }),
      accessToken: 'new-access-token',
      expiresIn: 3600,
    });
  }),

  http.post(api('/auth/forgot-password'), () => new HttpResponse(null, { status: 200 })),
  http.post(api('/auth/reset-password'), async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string; password: string };
    if (body.code === '000000') {
      return HttpResponse.json(
        {
          code: 'CODE_MISMATCH',
          details: [{ field: 'code', message: 'That code is not valid.' }],
        },
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 200 });
  }),

  http.get(api('/identify'), ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    }
    return HttpResponse.json({ ok: true });
  }),
];

export function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * An unsigned JWT with a real payload.
 *
 * The client only ever decodes the payload to read `exp`; signature
 * verification is the API's job. A structurally valid token is therefore
 * enough to exercise every code path here.
 */
export function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
}
