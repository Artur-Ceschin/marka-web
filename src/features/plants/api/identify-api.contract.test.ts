import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';

import { identify, identifyPhoto } from './identify-api';

// jsdom has no canvas or createImageBitmap, so the resize step is replaced with
// a small fixed blob. What is under test is what happens around it.
vi.mock('../lib/prepare-image', () => ({
  prepareImage: vi.fn(async () => new Blob(['sixteen byte img'], { type: 'image/jpeg' })),
}));

const api = (path: string) => `${config.apiUrl}${path}`;

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('identify response tolerance', () => {
  it('accepts a match with no family, genus or common names', async () => {
    server.use(
      http.post(api('/identify'), () =>
        HttpResponse.json(
          {
            success: true,
            identificationToken: 'signed-identification-token',
            expiresIn: 86_400,
            candidates: [
              {
                species: 'Unknown sp.',
                scientificName: 'Unknown sp.',
                family: null,
                genus: null,
                confidence: 0.12,
              },
            ],
            certainty: 'low',
            timestamp: '2026-09-14T18:02:11.482Z',
            quota: { used: 4, limit: 10, remaining: 6 },
          },
          { status: 201 },
        ),
      ),
    );

    // A strict schema would throw here, after the credit was already spent.
    const result = await identify({ key: 'uploads/user-1/photo' });

    expect(result.candidates[0]?.species).toBe('Unknown sp.');
    expect(result.candidates[0]?.commonNames).toEqual([]);
    expect(result.candidates[0]?.family).toBeNull();
  });
});

describe('upload size', () => {
  it('refuses an oversized photo before sending anything to S3', async () => {
    let uploaded = false;
    server.use(
      http.post(api('/uploads'), () =>
        HttpResponse.json(
          {
            success: true,
            url: 'https://uploads.test/',
            fields: { key: 'uploads/user-1/photo' },
            key: 'uploads/user-1/photo',
            // Smaller than the 16-byte mocked photo.
            maxBytes: 8,
            expiresIn: 300,
          },
          { status: 201 },
        ),
      ),
      http.post('https://uploads.test/', () => {
        uploaded = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const attempt = identifyPhoto(new Blob(['original']));

    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({ code: 'IMAGE_TOO_LARGE' });
    expect(uploaded).toBe(false);
  });
});
