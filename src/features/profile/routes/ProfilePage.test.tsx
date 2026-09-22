import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { ProfilePage } from './ProfilePage';

// jsdom has no OffscreenCanvas; the cropping itself is not what these test.
vi.mock('../lib/prepare-avatar', () => ({
  prepareAvatar: vi.fn(async () => new Blob(['avatar'], { type: 'image/jpeg' })),
}));

const api = (path: string) => `${config.apiUrl}${path}`;

const profile = {
  success: true,
  userId: 'user-1',
  email: 'artur@example.com',
  emailVerified: true,
  createdAt: '2026-09-10T12:44:21.155Z',
};

function servePreview(name: string | null) {
  server.use(
    http.post(api('/me/home-location/preview'), () =>
      name === null
        ? HttpResponse.json({ error: { code: 'validation', message: 'no' } }, { status: 400 })
        : HttpResponse.json({ success: true, name }),
    ),
  );
}

function serveProfile(overrides: Record<string, unknown> = {}) {
  let current = { ...profile, ...overrides };
  const patches: unknown[] = [];
  server.use(
    http.get(api('/me'), () => HttpResponse.json(current)),
    http.patch(api('/me'), async ({ request }) => {
      const changes = (await request.json()) as Record<string, unknown>;
      patches.push(changes);
      const { avatarKey, homeLocation, ...rest } = changes;
      const round2 = (value: number) => Math.round(value * 100) / 100;
      current = {
        ...current,
        ...rest,
        ...(avatarKey ? { avatarUrl: 'https://cdn.test/a.jpg' } : {}),
        // The API stores a home location rounded to two decimals.
        ...(homeLocation
          ? {
              homeLocation: {
                latitude: round2((homeLocation as { latitude: number }).latitude),
                longitude: round2((homeLocation as { longitude: number }).longitude),
              },
              homeLocationName: 'Boa Vista, Roraima, Brazil',
            }
          : {}),
      };
      return HttpResponse.json(current);
    }),
  );
  return { patches };
}

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
  Reflect.deleteProperty(navigator, 'geolocation');
});

describe('ProfilePage', () => {
  it('builds initials from a name when there is one', async () => {
    serveProfile({ name: 'Artur Ceschin' });
    await renderWithRouter(<ProfilePage />);

    expect(await screen.findByText('AC')).toBeInTheDocument();
  });

  it('shows the account and falls back to initials without a picture', async () => {
    serveProfile();
    await renderWithRouter(<ProfilePage />);

    expect(await screen.findByText('artur@example.com')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    // One letter from the address, since no name is set yet.
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('sends only what changed', async () => {
    const { patches } = serveProfile({ name: 'Artur', bio: 'Old bio' });
    const user = userEvent.setup();
    await renderWithRouter(<ProfilePage />);

    await user.clear(await screen.findByLabelText('About you'));
    await user.type(screen.getByLabelText('About you'), 'I grow lupines on a balcony.');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => {
      expect(patches).toEqual([{ bio: 'I grow lupines on a balcony.' }]);
    });
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
  });

  it('clears a bio that was emptied', async () => {
    const { patches } = serveProfile({ bio: 'Old bio' });
    const user = userEvent.setup();
    await renderWithRouter(<ProfilePage />);

    await user.clear(await screen.findByLabelText('About you'));
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => {
      expect(patches).toEqual([{ bio: null }]);
    });
  });

  it('uploads a picture and saves its key', async () => {
    const { patches } = serveProfile();
    const user = userEvent.setup();
    const { container } = await renderWithRouter(<ProfilePage />);
    await screen.findByText('artur@example.com');

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(['jpeg'], 'me.jpg', { type: 'image/jpeg' }));
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => {
      expect(patches).toEqual([{ avatarKey: 'avatars/user-1/photo' }]);
    });
  });

  it('refuses a file that is not a JPEG or PNG', async () => {
    const { patches } = serveProfile();
    const { container } = await renderWithRouter(<ProfilePage />);
    await screen.findByText('artur@example.com');

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    // Fired directly rather than through userEvent: `accept` already filters
    // the picker, so this is the case the code still has to handle itself.
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'notes.txt', { type: 'text/plain' })] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/JPEG or PNG/);
    expect(patches).toEqual([]);
  });

  it('refuses a bio over the limit before sending anything', async () => {
    const { patches } = serveProfile();
    const user = userEvent.setup();
    await renderWithRouter(<ProfilePage />);

    const bio = await screen.findByLabelText('About you');
    await user.click(bio);
    await user.paste('x'.repeat(501));
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(await screen.findByText(/Keep it under 500/)).toBeInTheDocument();
    expect(patches).toEqual([]);
  });

  it('sends a home location at full precision and shows the rounded answer', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: { latitude: -23.561357, longitude: -46.656429 },
          } as GeolocationPosition);
        },
      },
    });
    const { patches } = serveProfile();
    servePreview('S\u00e3o Paulo, Brazil');
    const user = userEvent.setup();
    await renderWithRouter(<ProfilePage />);

    await user.click(await screen.findByRole('button', { name: 'Use my current location' }));
    // Named before saving, from the preview, with the coordinates beside it.
    expect(await screen.findByText('S\u00e3o Paulo, Brazil')).toBeInTheDocument();
    expect(screen.getByText('-23.56, -46.66')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => {
      expect(patches).toEqual([{ homeLocation: { latitude: -23.561357, longitude: -46.656429 } }]);
    });
    // The API answers with a name for those coordinates, and that is what shows.
    expect(await screen.findByText('Boa Vista, Roraima, Brazil')).toBeInTheDocument();
  });

  it('clears the name as well when the location is removed', async () => {
    const { patches } = serveProfile({
      homeLocation: { latitude: 3.37, longitude: -59.83 },
      homeLocationName: 'Boa Vista, Roraima, Brazil',
    });
    const user = userEvent.setup();
    await renderWithRouter(<ProfilePage />);

    await user.click(await screen.findByRole('button', { name: 'Remove location' }));

    expect(screen.queryByText('Boa Vista, Roraima, Brazil')).not.toBeInTheDocument();
    expect(screen.getByText('Not set')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() => {
      expect(patches).toEqual([{ homeLocation: null }]);
    });
  });

  it('still shows the pick when the preview cannot name it', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({ coords: { latitude: 3.36, longitude: -59.84 } } as GeolocationPosition);
        },
      },
    });
    serveProfile();
    servePreview(null);
    const user = userEvent.setup();
    await renderWithRouter(<ProfilePage />);

    await user.click(await screen.findByRole('button', { name: 'Use my current location' }));

    expect(await screen.findByText('Your current location')).toBeInTheDocument();
    expect(screen.getByText('3.36, -59.84')).toBeInTheDocument();
  });

  it('shows the place name, and coordinates when there is none', async () => {
    serveProfile({
      homeLocation: { latitude: 3.37, longitude: -59.83 },
      homeLocationName: 'Boa Vista, Roraima, Brazil',
    });
    const { unmount } = await renderWithRouter(<ProfilePage />);
    expect(await screen.findByText('Boa Vista, Roraima, Brazil')).toBeInTheDocument();
    unmount();

    // A point with no locality saves fine, and falls back to coordinates.
    serveProfile({ homeLocation: { latitude: 3.37, longitude: -59.83 } });
    await renderWithRouter(<ProfilePage />);
    expect(await screen.findByText('3.37, -59.83')).toBeInTheDocument();
  });

  it('rebuilds a missing profile row and saves again', async () => {
    let patchCalls = 0;
    let meCalls = 0;
    server.use(
      http.get(api('/me'), () => {
        meCalls += 1;
        return HttpResponse.json(profile);
      }),
      http.patch(api('/me'), async ({ request }) => {
        patchCalls += 1;
        // The nested error shape these routes use.
        if (patchCalls === 1) {
          return HttpResponse.json(
            { error: { code: 'PROFILE_NOT_FOUND', message: 'No profile row' } },
            { status: 404 },
          );
        }
        return HttpResponse.json({ ...profile, ...((await request.json()) as object) });
      }),
    );
    const user = userEvent.setup();
    await renderWithRouter(<ProfilePage />);

    await user.type(await screen.findByLabelText('Full name'), 'Artur');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
    expect(patchCalls).toBe(2);
    expect(meCalls).toBeGreaterThan(1);
  });

  it('says to choose the photo again when the upload is gone', async () => {
    serveProfile();
    server.use(
      http.patch(api('/me'), () =>
        HttpResponse.json(
          { error: { code: 'UPLOAD_NOT_FOUND', message: 'Upload not found' } },
          { status: 404 },
        ),
      ),
    );
    const user = userEvent.setup();
    const { container } = await renderWithRouter(<ProfilePage />);
    await screen.findByText('artur@example.com');

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(['jpeg'], 'me.jpg', { type: 'image/jpeg' }));
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/expired/i);
  });

  it('has no accessibility violations', async () => {
    serveProfile({ name: 'Artur', bio: 'Balcony gardener.' });
    const { container } = await renderWithRouter(<ProfilePage />);
    await screen.findByText('artur@example.com');

    expect(await axe(container)).toHaveNoViolations();
  });
});
