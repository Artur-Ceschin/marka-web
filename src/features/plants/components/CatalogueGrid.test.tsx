import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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
const ID = '2026-09-14T18:02:11.482Z#a41c09f2';

type Item = Record<string, unknown> & { detectionId: string };

const detection = (overrides: Record<string, unknown> = {}): Item => ({
  detectionId: ID,
  imageUrl: 'https://images.test/1.jpg',
  candidates: [
    {
      species: 'Geranium sylvaticum',
      scientificName: 'Geranium sylvaticum L.',
      commonNames: [],
      family: 'Geraniaceae',
      genus: 'Geranium',
      confidence: 0.9,
    },
  ],
  certainty: 'high',
  status: 'confirmed',
  createdAt: '2026-09-14T18:02:11.482Z',
  confirmedSpecies: 'Geranium sylvaticum',
  ...overrides,
});

/** A tiny stateful backend: the list reflects deletes, PATCH records bodies. */
function serveCatalogue(initial: Item) {
  let items = [initial];
  const patches: unknown[] = [];
  const deletes: string[] = [];
  server.use(
    http.get(api('/identifications'), () => HttpResponse.json({ success: true, items })),
    http.patch(api('/detections/:id'), async ({ request }) => {
      const changes = (await request.json()) as Record<string, unknown>;
      patches.push(changes);
      const next: Item = { ...initial };
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) delete next[key];
        else next[key] = value;
      }
      items = [next];
      return HttpResponse.json({ success: true, ...next });
    }),
    http.delete(api('/detections/:id'), ({ params }) => {
      const id = decodeURIComponent(String(params.id));
      deletes.push(id);
      items = items.filter((item) => item.detectionId !== id);
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return { patches, deletes };
}

async function openEdit() {
  const user = userEvent.setup();
  await renderWithRouter(<CatalogueGrid />);
  await user.click(await screen.findByRole('button', { name: 'Edit Geranium sylvaticum' }));
  return { user, dialog: screen.getByRole('dialog', { name: 'Edit plant' }) };
}

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), refreshToken: 'refresh-token' });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
  Reflect.deleteProperty(navigator, 'geolocation');
});

describe('CatalogueGrid editing', () => {
  it('names each icon button after its plant', async () => {
    serveCatalogue(detection());
    await renderWithRouter(<CatalogueGrid />);

    expect(
      await screen.findByRole('button', { name: 'Edit Geranium sylvaticum' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Geranium sylvaticum' })).toBeInTheDocument();
  });

  it('sends only the notes that changed and shows them on the card', async () => {
    const { patches } = serveCatalogue(detection());
    const { user, dialog } = await openEdit();

    await user.type(within(dialog).getByLabelText('Notes'), 'By the garden gate');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(patches).toEqual([{ notes: 'By the garden gate' }]);
    expect(screen.getByText('By the garden gate')).toBeInTheDocument();
  });

  it('removes a cleared note with null', async () => {
    const { patches } = serveCatalogue(detection({ notes: 'Old note' }));
    const { user, dialog } = await openEdit();

    await user.clear(within(dialog).getByLabelText('Notes'));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(patches).toEqual([{ notes: null }]);
    });
  });

  it('closes without a request when nothing changed', async () => {
    const { patches } = serveCatalogue(detection());
    const { user, dialog } = await openEdit();

    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(patches).toEqual([]);
  });

  it('refuses a date in the future before sending anything', async () => {
    const { patches } = serveCatalogue(detection());
    const { user, dialog } = await openEdit();

    fireEvent.change(within(dialog).getByLabelText('When you saw it'), {
      target: { value: '2999-01-01T10:00' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByText('That date is in the future.')).toBeInTheDocument();
    expect(patches).toEqual([]);
  });

  it('sends the observed date with an offset', async () => {
    const { patches } = serveCatalogue(detection());
    const { user, dialog } = await openEdit();

    fireEvent.change(within(dialog).getByLabelText('When you saw it'), {
      target: { value: '2026-09-13T16:20' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(patches).toHaveLength(1);
    });
    expect((patches[0] as { observedAt: string }).observedAt).toMatch(
      /^2026-09-13T16:20:00[+-]\d{2}:\d{2}$/,
    );
  });

  it('uses the current location, rounded, and can remove it', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({ coords: { latitude: -23.5505, longitude: -46.6333 } } as GeolocationPosition);
        },
      },
    });
    const { patches } = serveCatalogue(detection());
    const { user, dialog } = await openEdit();

    await user.click(within(dialog).getByRole('button', { name: 'Use my current location' }));
    expect(within(dialog).getByText('-23.55, -46.63')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(patches).toEqual([{ location: { latitude: -23.55, longitude: -46.63 } }]);
    });
  });

  it('shows a server validation message under its field', async () => {
    serveCatalogue(detection());
    server.use(
      http.patch(api('/detections/:id'), () =>
        HttpResponse.json(
          {
            success: false,
            code: 'VALIDATION_ERROR',
            error: 'Invalid request',
            details: [{ field: 'notes', message: 'Notes contain unsupported characters.' }],
          },
          { status: 400 },
        ),
      ),
    );
    const { user, dialog } = await openEdit();

    await user.type(within(dialog).getByLabelText('Notes'), 'x');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(
      await within(dialog).findByText('Notes contain unsupported characters.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Notes')).toHaveAttribute('aria-invalid', 'true');
  });

  it('explains when the plant was deleted elsewhere', async () => {
    serveCatalogue(detection());
    server.use(
      http.patch(api('/detections/:id'), () =>
        HttpResponse.json(
          { success: false, code: 'DETECTION_NOT_FOUND', error: 'Detection not found' },
          { status: 404 },
        ),
      ),
    );
    const { user, dialog } = await openEdit();

    await user.type(within(dialog).getByLabelText('Notes'), 'x');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('This plant was already deleted.')).toBeInTheDocument();
  });

  it('has no accessibility violations with the dialog open', async () => {
    serveCatalogue(detection());
    await openEdit();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('CatalogueGrid deleting', () => {
  it('asks first, then removes the plant and moves focus to the list heading', async () => {
    const { deletes } = serveCatalogue(detection());
    const user = userEvent.setup();
    await renderWithRouter(<CatalogueGrid />);

    await user.click(await screen.findByRole('button', { name: 'Delete Geranium sylvaticum' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Delete this plant?' });
    // The one consequence nobody would guess.
    expect(within(dialog).getByText(/still counts towards today/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByAltText('Geranium sylvaticum')).not.toBeInTheDocument();
    });
    expect(deletes).toEqual([ID]);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Identified plants' })).toHaveFocus();
    });
  });

  it('cancelling deletes nothing', async () => {
    const { deletes } = serveCatalogue(detection());
    const user = userEvent.setup();
    await renderWithRouter(<CatalogueGrid />);

    await user.click(await screen.findByRole('button', { name: 'Delete Geranium sylvaticum' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByAltText('Geranium sylvaticum')).toBeInTheDocument();
    expect(deletes).toEqual([]);
  });

  it('treats an already deleted plant as deleted', async () => {
    serveCatalogue(detection());
    const user = userEvent.setup();
    await renderWithRouter(<CatalogueGrid />);
    server.use(
      http.delete(api('/detections/:id'), () =>
        HttpResponse.json(
          { success: false, code: 'DETECTION_NOT_FOUND', error: 'Detection not found' },
          { status: 404 },
        ),
      ),
      http.get(api('/identifications'), () => HttpResponse.json({ success: true, items: [] })),
    );

    await user.click(await screen.findByRole('button', { name: 'Delete Geranium sylvaticum' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(screen.queryByAltText('Geranium sylvaticum')).not.toBeInTheDocument();
  });

  it('keeps the plant and says why when the delete fails', async () => {
    serveCatalogue(detection());
    const user = userEvent.setup();
    await renderWithRouter(<CatalogueGrid />);
    server.use(
      http.delete(api('/detections/:id'), () =>
        HttpResponse.json({ success: false, code: 'SERVER_ERROR', error: 'boom' }, { status: 500 }),
      ),
    );

    await user.click(await screen.findByRole('button', { name: 'Delete Geranium sylvaticum' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('alertdialog');
    expect(await within(dialog).findByRole('alert')).toBeInTheDocument();
    expect(screen.getByAltText('Geranium sylvaticum')).toBeInTheDocument();
  });
});
