import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, getIdToken, getRefreshToken, setTokens } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { PlantsHomePage } from './PlantsHomePage';

const api = (path: string) => `${config.apiUrl}${path}`;

beforeEach(() => {
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), refreshToken: 'refresh-token' });
});

afterEach(() => {
  clearTokens();
  resetSessionStateForTests();
});

describe('PlantsHomePage', () => {
  it('confirms an authenticated round trip to the API', async () => {
    let authorization: string | null = null;
    server.use(
      http.get(api('/identify'), ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      }),
    );

    await renderWithRouter(<PlantsHomePage />);

    expect(await screen.findByText('Connected to the Marka API.')).toBeInTheDocument();
    expect(authorization).toMatch(/^Bearer /);
  });

  it('says so when the API call fails', async () => {
    server.use(http.get(api('/identify'), () => HttpResponse.json({}, { status: 500 })));

    await renderWithRouter(<PlantsHomePage />);

    expect(await screen.findByText('Could not reach the Marka API.')).toBeInTheDocument();
  });

  it('signs out by dropping every token in this browser', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<PlantsHomePage />);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(getIdToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderWithRouter(<PlantsHomePage />);
    await screen.findByText('Connected to the Marka API.');
    expect(await axe(container)).toHaveNoViolations();
  });
});
