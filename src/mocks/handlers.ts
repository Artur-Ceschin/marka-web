import { HttpResponse, http } from 'msw';

import { config } from '@/lib/config';

const api = (path: string) => `${config.apiUrl}${path}`;

const storedDetection = {
  success: true,
  userId: 'user-1',
  detectionId: '2026-09-10T12:00:00.000Z#abcd1234',
  imageKey: 'detections/user-1/photo',
  imageUrl: 'https://images.test/detections/user-1/photo',
  candidates: [
    {
      species: 'Rosa gallica',
      scientificName: 'Rosa gallica L.',
      commonNames: ['French rose'],
      family: 'Rosaceae',
      genus: 'Rosa',
      confidence: 0.82,
    },
  ],
  certainty: 'high',
  status: 'confirmed',
  createdAt: '2026-09-10T12:00:00.000Z',
  confirmedSpecies: 'Rosa gallica',
  confirmedAt: '2026-09-10T12:01:00.000Z',
  enrichment: {
    description: 'A shrub rose with fragrant flowers.',
    care: 'Full sun, well-drained soil.',
    toxicity: 'Not toxic to cats or dogs.',
    nativeStatus: 'Native to southern and central Europe.',
  },
};

/**
 * Default handlers, modelled on the real API.
 *
 * Deliberately shaped like the deployed contract rather than like whatever the
 * tests find convenient: the status codes, the error codes and the
 * `{ success: false, error, code, details? }` body are what the UI branches on,
 * so a mock that drifts from them makes every test built on it meaningless.
 */
export const handlers = [
  http.post(api('/auth/signup'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'taken@example.com') {
      return HttpResponse.json(
        { success: false, code: 'EMAIL_ALREADY_REGISTERED', error: 'Email already exists' },
        { status: 409 },
      );
    }
    if (body.password === 'Breached123') {
      return HttpResponse.json(
        {
          success: false,
          code: 'VALIDATION_ERROR',
          error: 'Validation failed',
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
        { success: false, code: 'INVALID_CODE', error: 'Invalid verification code.' },
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
        { success: false, code: 'USER_NOT_CONFIRMED', error: 'User is not confirmed.' },
        { status: 403 },
      );
    }
    if (body.password === 'wrongpassword') {
      return HttpResponse.json(
        { success: false, code: 'INVALID_CREDENTIALS', error: 'Incorrect email or password.' },
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
        { success: false, code: 'SESSION_EXPIRED', error: 'Refresh token is no longer valid.' },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      idToken: makeJwt({ exp: nowInSeconds() + 3600 }),
      accessToken: 'new-access-token',
      expiresIn: 3600,
    });
  }),

  http.post(api('/auth/signout'), () => new HttpResponse(null, { status: 204 })),

  http.get(api('/me'), ({ request }) => {
    if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      success: true,
      userId: 'b428a418-2001-70dc-2a7c-ab479eb808fc',
      email: 'artur@example.com',
      emailVerified: true,
      createdAt: '2026-09-10T12:44:21.155Z',
    });
  }),

  http.post(api('/auth/forgot-password'), () => new HttpResponse(null, { status: 200 })),
  http.post(api('/auth/reset-password'), async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string; password: string };
    if (body.code === '000000') {
      return HttpResponse.json(
        {
          success: false,
          code: 'INVALID_CODE',
          error: 'That code is not valid.',
          details: [{ field: 'code', message: 'That code is not valid.' }],
        },
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 200 });
  }),

  http.get(api('/identifications'), ({ request }) => {
    if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ success: true, items: [] });
  }),

  http.post(api('/uploads'), () =>
    HttpResponse.json(
      {
        success: true,
        url: 'https://uploads.test/',
        fields: { key: 'uploads/user-1/photo', Policy: 'policy', 'X-Amz-Signature': 'signature' },
        key: 'uploads/user-1/photo',
        maxBytes: 10_485_760,
        expiresIn: 300,
      },
      { status: 201 },
    ),
  ),

  http.post('https://uploads.test/', () => new HttpResponse(null, { status: 204 })),

  http.post(api('/identify'), () =>
    HttpResponse.json(
      {
        success: true,
        identificationToken: 'signed-identification-token',
        expiresIn: 86_400,
        candidates: [
          {
            species: 'Rosa gallica',
            scientificName: 'Rosa gallica L.',
            commonNames: ['French rose'],
            family: 'Rosaceae',
            genus: 'Rosa',
            confidence: 0.82,
            images: [],
          },
        ],
        certainty: 'high',
        timestamp: '2026-09-10T12:00:00.000Z',
        quota: { used: 1, limit: 10, remaining: 9 },
      },
      { status: 201 },
    ),
  ),

  http.get(api('/detections/:detectionId'), () => HttpResponse.json(storedDetection)),

  http.patch(api('/detections/:detectionId'), async ({ request }) =>
    HttpResponse.json({ ...storedDetection, ...((await request.json()) as object) }),
  ),

  http.delete(api('/detections/:detectionId'), () => new HttpResponse(null, { status: 204 })),

  http.post(api('/detections'), () => HttpResponse.json(storedDetection, { status: 201 })),
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
