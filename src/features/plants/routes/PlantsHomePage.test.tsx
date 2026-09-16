import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, getIdToken, hasSessionMarker, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { PlantsHomePage } from './PlantsHomePage';

// jsdom has no canvas or EXIF parser; both steps are replaced with fixed
// results. What is under test is the flow around them.
vi.mock('../lib/prepare-image', () => ({
  prepareImage: vi.fn(async () => new Blob(['prepared'], { type: 'image/jpeg' })),
}));
vi.mock('../lib/read-location', () => ({
  readPhotoLocation: vi.fn(async () => ({ latitude: -23.55, longitude: -46.63 })),
}));

const api = (path: string) => `${config.apiUrl}${path}`;
const DETECTION_ID = '2026-09-14T18:02:11.482Z#a41c09f2';

const identifyBody = (overrides: Record<string, unknown> = {}) => ({
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
    },
  ],
  certainty: 'high',
  timestamp: '2026-09-14T18:02:11.482Z',
  quota: { used: 1, limit: 10, remaining: 9 },
  ...overrides,
});

const catalogueItem = (n: number, species: string, confirmed: boolean) => ({
  detectionId: `2026-09-1${n}T10:00:00.000Z#0000000${n}`,
  imageUrl: `https://images.test/${n}.jpg`,
  candidates: [
    {
      species,
      scientificName: species,
      commonNames: [],
      family: 'Plantae',
      genus: 'Plantae',
      confidence: 0.7,
    },
  ],
  certainty: 'high',
  status: confirmed ? 'confirmed' : 'pending_confirmation',
  createdAt: '2026-09-14T10:00:00.000Z',
  userId: 'user-1',
  imageKey: `uploads/user-1/${n}`,
  ...(confirmed ? { confirmedSpecies: species, confirmedAt: '2026-09-14T10:01:00.000Z' } : {}),
});

async function pickPhoto() {
  const user = userEvent.setup();
  const view = await renderWithRouter(<PlantsHomePage />);
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('file input not found');
  await user.upload(input, new File(['jpeg'], 'rose.jpg', { type: 'image/jpeg' }));
  return { user, ...view };
}

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('PlantsHomePage', () => {
  it('shows the drop zone and an empty catalogue', async () => {
    await renderWithRouter(<PlantsHomePage />);

    expect(screen.getByRole('button', { name: /drop a plant photo here/i })).toBeInTheDocument();
    expect(await screen.findByText('No plants yet')).toBeInTheDocument();
  });

  it('identifies a photo, sending its location, and shows the matches', async () => {
    let body: unknown = null;
    server.use(
      http.post(api('/identify'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(identifyBody(), { status: 201 });
      }),
    );

    await pickPhoto();

    expect(await screen.findByText('Rosa gallica L.')).toBeInTheDocument();
    expect(screen.getByText(/82% match/)).toBeInTheDocument();
    expect(screen.getByText('9 of 10 identifications left today')).toBeInTheDocument();
    expect(body).toEqual({
      key: 'uploads/user-1/photo',
      location: { latitude: -23.55, longitude: -46.63 },
    });
  });

  it('shows a reference photo for each match that has one', async () => {
    server.use(
      http.post(api('/identify'), () =>
        HttpResponse.json(
          identifyBody({
            candidates: [
              {
                species: 'Rosa gallica',
                scientificName: 'Rosa gallica L.',
                commonNames: ['French rose'],
                family: 'Rosaceae',
                genus: 'Rosa',
                confidence: 0.82,
                images: [{ url: 'https://images.test/rosa.jpg', author: 'A. Botanist' }],
              },
              {
                species: 'Rosa canina',
                scientificName: 'Rosa canina L.',
                commonNames: [],
                family: 'Rosaceae',
                genus: 'Rosa',
                confidence: 0.1,
              },
            ],
          }),
          { status: 201 },
        ),
      ),
    );

    const { container } = await pickPhoto();
    await screen.findByText('Rosa canina L.');

    const thumbs = [...container.querySelectorAll('li img')].map((img) => img.getAttribute('src'));
    expect(thumbs).toEqual(['https://images.test/rosa.jpg']);
    expect(screen.getByText('Photo: A. Botanist')).toBeInTheDocument();
  });

  it('renders matches without thumbnails when the API sends no photos', async () => {
    const { container } = await pickPhoto();
    await screen.findByText('Rosa gallica L.');

    expect(container.querySelector('li img')).toBeNull();
  });

  it('warns rather than nudging when the server is not sure', async () => {
    server.use(
      http.post(api('/identify'), () =>
        HttpResponse.json(identifyBody({ certainty: 'low' }), { status: 201 }),
      ),
    );

    await pickPhoto();

    expect(await screen.findByText(/not sure about this one/i)).toBeInTheDocument();
  });

  it('confirms a match and shows its care details', async () => {
    let confirmBody: unknown = null;
    server.use(
      http.post(api('/detections'), async ({ request }) => {
        confirmBody = await request.json();
        return HttpResponse.json(
          {
            success: true,
            detectionId: DETECTION_ID,
            imageUrl: 'https://images.test/detection.jpg',
            candidates: identifyBody().candidates,
            certainty: 'high',
            status: 'confirmed',
            createdAt: '2026-09-14T18:02:11.482Z',
            confirmedSpecies: 'Rosa gallica',
            enrichment: {
              description: 'A shrub rose with fragrant flowers.',
              care: 'Full sun, well-drained soil.',
              toxicity: 'Not toxic to cats or dogs.',
              nativeStatus: 'Native to southern and central Europe.',
            },
          },
          { status: 201 },
        );
      }),
    );

    const { user } = await pickPhoto();
    await user.click(await screen.findByRole('button', { name: 'This is it' }));

    expect(await screen.findByText('Added to your catalogue')).toBeInTheDocument();
    expect(screen.getByText('Full sun, well-drained soil.')).toBeInTheDocument();
    // The signed result from /identify goes back, not an id: nothing was stored yet.
    expect(confirmBody).toEqual({
      identificationToken: 'signed-identification-token',
      species: 'Rosa gallica',
    });
  });

  it('explains a photo with no plant in it, and offers a new photo not a retry', async () => {
    server.use(
      http.post(api('/identify'), () =>
        HttpResponse.json(
          { success: false, code: 'NO_MATCH', error: 'No plant found' },
          { status: 422 },
        ),
      ),
    );

    const { user } = await pickPhoto();

    expect(
      await screen.findByRole('heading', { name: /couldn.t find a plant/i }),
    ).toBeInTheDocument();
    // Retrying the same photo would spend another credit for the same answer.
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Identify another plant' }));
    expect(screen.getByRole('button', { name: /drop a plant photo here/i })).toBeInTheDocument();
  });

  it('says when the daily limit resets', async () => {
    server.use(
      http.post(api('/identify'), () =>
        HttpResponse.json(
          { success: false, code: 'DAILY_LIMIT_REACHED', error: 'Daily limit reached' },
          { status: 429, headers: { 'Retry-After': '3600' } },
        ),
      ),
    );

    await pickPhoto();

    expect(await screen.findByText(/you can identify more plants after/i)).toBeInTheDocument();
  });

  it('lets them try again when identification is down', async () => {
    let calls = 0;
    server.use(
      http.post(api('/identify'), () => {
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json(
            { success: false, code: 'IDENTIFICATION_FAILED', error: 'PlantNet unavailable' },
            { status: 502 },
          );
        }
        return HttpResponse.json(identifyBody(), { status: 201 });
      }),
    );

    const { user } = await pickPhoto();
    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Rosa gallica L.')).toBeInTheDocument();
    expect(calls).toBe(2);
  });

  it('lists identified plants and loads the next page', async () => {
    const cursors: (string | null)[] = [];
    server.use(
      http.get(api('/identifications'), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        cursors.push(cursor);
        if (!cursor) {
          return HttpResponse.json({
            success: true,
            items: [
              catalogueItem(1, 'Geranium sylvaticum', true),
              catalogueItem(2, 'Rosa gallica', false),
            ],
            nextCursor: '2026-09-13T09:41:55.203Z#0c7e11d4',
          });
        }
        return HttpResponse.json({
          success: true,
          items: [catalogueItem(3, 'Lupinus polyphyllus', true)],
        });
      }),
    );
    const user = userEvent.setup();
    await renderWithRouter(<PlantsHomePage />);

    expect(await screen.findByText('Geranium sylvaticum')).toBeInTheDocument();
    // An unconfirmed detection shows its best guess, marked as such.
    expect(screen.getByText('Not confirmed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(await screen.findByText('Lupinus polyphyllus')).toBeInTheDocument();
    expect(cursors).toContain('2026-09-13T09:41:55.203Z#0c7e11d4');
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('signs out by dropping every token in this browser', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<PlantsHomePage />);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(getIdToken()).toBeNull();
    expect(hasSessionMarker()).toBe(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderWithRouter(<PlantsHomePage />);
    await screen.findByText('No plants yet');
    expect(await axe(container)).toHaveNoViolations();
  });
});
