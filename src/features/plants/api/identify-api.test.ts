import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';

import { confirmDetection, identify, uploadPhoto } from './identify-api';

const api = (path: string) => `${config.apiUrl}${path}`;

const upload = {
  url: 'https://uploads.test/',
  fields: { key: 'uploads/user-1/photo', Policy: 'policy', 'X-Amz-Signature': 'signature' },
  key: 'uploads/user-1/photo',
  maxBytes: 10_485_760,
  expiresIn: 300,
};

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('uploadPhoto', () => {
  it('sends every presigned field before the file, and no bearer token', async () => {
    let names: string[] = [];
    let authorization: string | null = 'not captured';
    server.use(
      http.post(upload.url, async ({ request }) => {
        authorization = request.headers.get('Authorization');
        // Read the raw multipart body: the order the parts arrive in is what
        // S3 checks, and parsing into FormData would hide it.
        const body = await request.text();
        // \b keeps `filename="blob"` on the file part from matching as a name.
        names = [...body.matchAll(/\bname="([^"]+)"/g)].map((match) => match[1] ?? '');
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await uploadPhoto(upload, new Blob(['jpeg'], { type: 'image/jpeg' }));

    // S3 rejects the policy if the file part comes before any field.
    expect(names).toEqual(['key', 'Policy', 'X-Amz-Signature', 'file']);
    expect(authorization).toBeNull();
  });

  it('fails loudly when S3 refuses the upload', async () => {
    server.use(http.post(upload.url, () => new HttpResponse('<Error/>', { status: 400 })));

    await expect(uploadPhoto(upload, new Blob(['jpeg']))).rejects.toBeInstanceOf(ApiError);
  });
});

describe('identify', () => {
  it('surfaces the daily limit with the server message and how long to wait', async () => {
    server.use(
      http.post(api('/identify'), () =>
        HttpResponse.json(
          {
            success: false,
            error: 'You have used all 10 identifications for today.',
            code: 'DAILY_LIMIT_REACHED',
          },
          { status: 429, headers: { 'Retry-After': '3600' } },
        ),
      ),
    );

    const error = await identify({ key: upload.key }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('DAILY_LIMIT_REACHED');
    expect((error as ApiError).retryAfterSeconds).toBe(3600);
    expect((error as ApiError).message).toBe('You have used all 10 identifications for today.');
  });
});

describe('confirmDetection', () => {
  it('sends the signed identification back with the chosen species', async () => {
    let body: unknown;
    server.use(
      http.post(api('/detections'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          {
            detectionId: '2026-09-10T12:00:00.000Z#abcd1234',
            imageUrl: 'https://images.test/photo.jpg',
            candidates: [],
            certainty: 'high',
            status: 'confirmed',
            createdAt: '2026-09-10T12:00:00.000Z',
            confirmedSpecies: 'Rosa gallica',
          },
          { status: 201 },
        );
      }),
    );

    const saved = await confirmDetection('signed-identification-token', 'Rosa gallica');

    expect(body).toEqual({
      identificationToken: 'signed-identification-token',
      species: 'Rosa gallica',
    });
    expect(saved.confirmedSpecies).toBe('Rosa gallica');
    // Declined enrichment arrives as an absent field, not a failed save.
    expect(saved.enrichment).toBeUndefined();
  });
});
