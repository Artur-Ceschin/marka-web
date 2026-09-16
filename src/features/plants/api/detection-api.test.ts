import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';

import { deleteDetection, getDetection, updateDetection } from './identify-api';

const DETECTION_ID = '2026-09-10T12:00:00.000Z#abcd1234';

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('detection API', () => {
  it('encodes the id so the # does not become a URL fragment', async () => {
    let requested = '';
    server.use(
      http.get(`${config.apiUrl}/detections/:detectionId`, ({ request, params }) => {
        requested = String(params.detectionId);
        expect(request.url).toContain('%23');
        return HttpResponse.json({
          detectionId: DETECTION_ID,
          imageUrl: 'https://images.test/photo',
          candidates: [],
          certainty: 'low',
          status: 'pending_confirmation',
          createdAt: '2026-09-10T12:00:00.000Z',
        });
      }),
    );

    await getDetection(DETECTION_ID);

    expect(requested).toBe(DETECTION_ID);
  });

  it('sends only the changed fields, with null meaning remove', async () => {
    let body: unknown;
    server.use(
      http.patch(`${config.apiUrl}/detections/:detectionId`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          detectionId: DETECTION_ID,
          imageUrl: 'https://images.test/photo',
          candidates: [],
          certainty: 'low',
          status: 'pending_confirmation',
          createdAt: '2026-09-10T12:00:00.000Z',
          notes: 'By the gate',
        });
      }),
    );

    const updated = await updateDetection(DETECTION_ID, { notes: 'By the gate', location: null });

    expect(body).toEqual({ notes: 'By the gate', location: null });
    expect(updated.notes).toBe('By the gate');
  });

  it('asks for content in the language the page is showing', async () => {
    let language: string | null = null;
    server.use(
      http.delete(`${config.apiUrl}/detections/:detectionId`, ({ request }) => {
        language = request.headers.get('Accept-Language');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    document.documentElement.lang = 'pt-BR';

    try {
      await deleteDetection(DETECTION_ID);
    } finally {
      document.documentElement.lang = '';
    }

    expect(language).toBe('pt-BR');
  });

  it('resolves on the empty 204 from a delete', async () => {
    await expect(deleteDetection(DETECTION_ID)).resolves.toBeUndefined();
  });
});
