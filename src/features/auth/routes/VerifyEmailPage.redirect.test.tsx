import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearTokens, getIdToken } from '@/lib/auth/token-store';
import { config } from '@/lib/config';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/router';

import {
  clearPendingCredentials,
  setPendingCredentials,
  takePendingCredentials,
} from '../pending-credentials';
import { setPendingEmail } from '../pending-verification';
import { peekSignInHandoff } from '../sign-in-handoff';
import { VerifyEmailPage } from './VerifyEmailPage';

const api = (path: string) => `${config.apiUrl}${path}`;
const EMAIL = 'new@example.com';

async function verify() {
  const user = userEvent.setup();
  await renderWithRouter(<VerifyEmailPage />);
  // The default handler accepts 123456.
  await user.type(screen.getByLabelText(/verification code/i), '123456');
}

function trackSignIn(respond: () => Response) {
  const calls: unknown[] = [];
  server.use(
    http.post(api('/auth/signin'), async ({ request }) => {
      calls.push(await request.json());
      return respond();
    }),
  );
  return calls;
}

beforeEach(() => {
  sessionStorage.clear();
  clearTokens();
  clearPendingCredentials();
  setPendingEmail(EMAIL);
});

afterEach(() => {
  clearTokens();
  clearPendingCredentials();
});

describe('after a successful verification', () => {
  it('signs in with the password from sign-up and holds a session', async () => {
    const calls = trackSignIn(() =>
      HttpResponse.json({ idToken: 'id', accessToken: 'a', expiresIn: 3600 }),
    );
    setPendingCredentials({ email: EMAIL, password: 'Passphrase123' });

    await verify();

    await expect.poll(() => calls).toEqual([{ email: EMAIL, password: 'Passphrase123' }]);
    await expect.poll(() => getIdToken()).toBe('id');
    // Went to the app, not to the sign-in screen.
    expect(peekSignInHandoff()).toBeNull();
  });

  it('forgets the password once it has been used', async () => {
    trackSignIn(() => HttpResponse.json({ idToken: 'id', accessToken: 'a', expiresIn: 3600 }));
    setPendingCredentials({ email: EMAIL, password: 'Passphrase123' });

    await verify();
    await expect.poll(() => getIdToken()).toBe('id');

    expect(takePendingCredentials(EMAIL)).toBeNull();
  });

  it('falls back to sign-in with the address prefilled when the password is gone', async () => {
    // What a reload between sign-up and verification looks like: memory is empty.
    const calls = trackSignIn(() => HttpResponse.json({}, { status: 500 }));

    await verify();

    await expect.poll(() => peekSignInHandoff()).toEqual({ email: EMAIL, notice: 'verified' });
    expect(calls).toEqual([]);
  });

  it('falls back to sign-in when the automatic sign-in fails', async () => {
    trackSignIn(() =>
      HttpResponse.json({ success: false, code: 'INVALID_CREDENTIALS' }, { status: 401 }),
    );
    setPendingCredentials({ email: EMAIL, password: 'Passphrase123' });

    await verify();

    // The account is verified either way, so they are never left stranded.
    await expect.poll(() => peekSignInHandoff()).toEqual({ email: EMAIL, notice: 'verified' });
    expect(getIdToken()).toBeNull();
  });

  it('never tries a password that belongs to a different address', async () => {
    const calls = trackSignIn(() => HttpResponse.json({}, { status: 500 }));
    setPendingCredentials({ email: 'someone-else@example.com', password: 'Passphrase123' });

    await verify();

    await expect.poll(() => peekSignInHandoff()).toEqual({ email: EMAIL, notice: 'verified' });
    expect(calls).toEqual([]);
  });
});
