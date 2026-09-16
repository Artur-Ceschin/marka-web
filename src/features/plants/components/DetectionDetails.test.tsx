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

import { CatalogueGrid } from './CatalogueGrid';

const api = (path: string) => `${config.apiUrl}${path}`;

const item = {
  detectionId: '2026-09-14T18:02:11.482Z#a41c09f2',
  imageUrl: 'https://images.test/1.jpg',
  candidates: [
    {
      species: 'Lupinus polyphyllus',
      scientificName: 'Lupinus polyphyllus Lindl.',
      commonNames: ['Garden lupin', 'Big-leaved lupine'],
      family: 'Fabaceae',
      genus: 'Lupinus',
      confidence: 0.82,
    },
    {
      species: 'Lupinus arboreus',
      scientificName: 'Lupinus arboreus Sims',
      commonNames: ['Yellow bush lupin'],
      family: 'Fabaceae',
      genus: 'Lupinus',
      confidence: 0.08,
    },
  ],
  certainty: 'high',
  status: 'confirmed',
  createdAt: '2026-09-14T18:02:11.482Z',
  confirmedSpecies: 'Lupinus polyphyllus',
  notes: 'By the garden gate',
  location: { latitude: -23.55, longitude: -46.63 },
  enrichment: {
    description: 'A tall perennial with dense flower spikes.',
    care: 'Full sun and well-drained soil.',
    toxicity: 'Seeds are toxic if eaten.',
    nativeStatus: 'Native to western North America.',
  },
};

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
  server.use(
    http.get(api('/identifications'), () => HttpResponse.json({ success: true, items: [item] })),
  );
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('plant details', () => {
  it('leads with the common name and keeps the scientific one', async () => {
    await renderWithRouter(<CatalogueGrid />);

    expect(await screen.findByText('Garden lupin')).toBeInTheDocument();
    expect(screen.getByText('Lupinus polyphyllus')).toBeInTheDocument();
  });

  it('opens everything known about the plant when the card is clicked', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<CatalogueGrid />);

    await user.click(await screen.findByRole('button', { name: 'Open Garden lupin' }));

    const dialog = screen.getByRole('dialog', { name: 'Garden lupin' });
    expect(
      within(dialog).getByText('A tall perennial with dense flower spikes.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Seeds are toxic if eaten.')).toBeInTheDocument();
    expect(within(dialog).getByText('By the garden gate')).toBeInTheDocument();
    expect(within(dialog).getByText('-23.55, -46.63')).toBeInTheDocument();
    // The matches that were not confirmed stay visible.
    expect(within(dialog).getByText(/Lupinus arboreus Sims/)).toBeInTheDocument();
  });

  it('goes from the details straight to editing', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<CatalogueGrid />);

    await user.click(await screen.findByRole('button', { name: 'Open Garden lupin' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /Edit plant/ }),
    );

    expect(screen.getByRole('dialog', { name: 'Edit plant' })).toBeInTheDocument();
  });

  it('has no accessibility violations with the details open', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<CatalogueGrid />);
    await user.click(await screen.findByRole('button', { name: 'Open Garden lupin' }));

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
