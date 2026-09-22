import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { PlantJournalPage } from './PlantJournalPage';

const api = (path: string) => `${config.apiUrl}${path}`;

const entry = (id: string, species: string, common: string[], dates: Record<string, string>) => ({
  detectionId: id,
  imageUrl: `https://images.test/${id}.jpg`,
  candidates: [
    {
      species,
      scientificName: species,
      commonNames: common,
      family: 'Fabaceae',
      genus: species.split(' ')[0],
      confidence: 0.8,
    },
  ],
  certainty: 'high',
  status: 'confirmed',
  confirmedSpecies: species,
  ...dates,
});

const items = [
  entry('a', 'Lupinus polyphyllus', ['Garden lupin'], {
    createdAt: '2026-09-14T10:00:00.000Z',
    observedAt: '2026-09-13T16:20:00Z',
  }),
  entry('b', 'Rosa canina', ['Dog rose'], { createdAt: '2026-09-02T10:00:00.000Z' }),
  entry('c', 'Malus domestica', [], { createdAt: '2026-08-21T10:00:00.000Z' }),
];

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('PlantJournalPage', () => {
  it('groups entries by month, newest first', async () => {
    server.use(
      http.get(api('/identifications'), () => HttpResponse.json({ success: true, items })),
    );
    await renderWithRouter(<PlantJournalPage />);

    const months = await screen.findAllByRole('heading', { level: 2 });
    expect(months.map((h) => h.textContent)).toEqual(['September 2026', 'August 2026']);
    // Two in September, one in August.
    expect(screen.getByText('2 entries')).toBeInTheDocument();
    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  it('leads with common names and dates an entry by when it was seen', async () => {
    server.use(
      http.get(api('/identifications'), () => HttpResponse.json({ success: true, items })),
    );
    await renderWithRouter(<PlantJournalPage />);

    expect(await screen.findByRole('button', { name: 'Garden lupin' })).toBeInTheDocument();
    expect(screen.getByText('Lupinus polyphyllus')).toBeInTheDocument();
    // observedAt is the 13th; createdAt is the 14th.
    expect(screen.getByText('Sep 13, 2026')).toBeInTheDocument();
    // No common name for this one, so the scientific name leads.
    expect(screen.getByRole('button', { name: 'Malus domestica' })).toBeInTheDocument();
  });

  it('opens the full record from an entry', async () => {
    server.use(
      http.get(api('/identifications'), () => HttpResponse.json({ success: true, items })),
    );
    const user = userEvent.setup();
    await renderWithRouter(<PlantJournalPage />);

    await user.click(await screen.findByRole('button', { name: 'Garden lupin' }));

    const dialog = screen.getByRole('dialog', { name: 'Garden lupin' });
    expect(within(dialog).getByRole('button', { name: /Edit plant/ })).toBeInTheDocument();
  });

  it('opens the same record from the photo', async () => {
    server.use(
      http.get(api('/identifications'), () => HttpResponse.json({ success: true, items })),
    );
    const user = userEvent.setup();
    const { container } = await renderWithRouter(<PlantJournalPage />);
    await screen.findByRole('button', { name: 'Garden lupin' });

    const photo = container.querySelector<HTMLButtonElement>('button[aria-hidden="true"]');
    expect(photo).not.toBeNull();
    await user.click(photo as HTMLButtonElement);

    expect(screen.getByRole('dialog', { name: 'Garden lupin' })).toBeInTheDocument();
  });

  it('says so when nothing has been identified yet', async () => {
    server.use(
      http.get(api('/identifications'), () => HttpResponse.json({ success: true, items: [] })),
    );
    await renderWithRouter(<PlantJournalPage />);

    expect(await screen.findByText('Your journal is empty')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    server.use(
      http.get(api('/identifications'), () => HttpResponse.json({ success: true, items })),
    );
    const { container } = await renderWithRouter(<PlantJournalPage />);
    await screen.findByRole('button', { name: 'Garden lupin' });

    expect(await axe(container)).toHaveNoViolations();
  });
});
