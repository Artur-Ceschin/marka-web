import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { config } from '@/lib/config';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/router';
import { getPendingEmail } from './pending-verification';
import { SignInPage } from './routes/SignInPage';
import { SignUpPage } from './routes/SignUpPage';
import { peekSignInHandoff } from './sign-in-handoff';

const api = (path: string) => `${config.apiUrl}${path}`;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe('sign-up against the API', () => {
  it('sends email and password, then remembers the address for verification', async () => {
    const user = userEvent.setup();
    let sent: unknown = null;
    server.use(
      http.post(api('/auth/signup'), async ({ request }) => {
        sent = await request.json();
        return new HttpResponse(null, { status: 201 });
      }),
    );

    await renderWithRouter(<SignUpPage />);
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passphrase123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await expect
      .poll(() => sent)
      .toEqual({
        email: 'new@example.com',
        password: 'Passphrase123',
      });
    // The verification screen needs the address, and it travels in storage
    // rather than the URL.
    await expect.poll(() => getPendingEmail()).toBe('new@example.com');
  });

  it('renders a 400 details entry against the field it names', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<SignUpPage />);

    await user.type(screen.getByLabelText('Email'), 'someone@example.com');
    // The handler rejects this password with a per-field detail.
    await user.type(screen.getByLabelText('Password'), 'Breached123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    const message = await screen.findByText('That password has appeared in a known data breach.');
    expect(message).toBeInTheDocument();
    // Next to the input it describes, not in a banner at the top.
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears a server field error once that field is edited', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<SignUpPage />);

    await user.type(screen.getByLabelText('Email'), 'someone@example.com');
    await user.type(screen.getByLabelText('Password'), 'Breached123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByText('That password has appeared in a known data breach.');

    await user.type(screen.getByLabelText('Password'), 'X');

    // The message described the value that was sent; it must not sit there
    // contradicting what is now on screen.
    expect(
      screen.queryByText('That password has appeared in a known data breach.'),
    ).not.toBeInTheDocument();
  });

  it('tells someone the address is taken instead of showing a field error', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<SignUpPage />);

    await user.type(screen.getByLabelText('Email'), 'taken@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passphrase123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    // A 409 is a different account state, not a validation failure.
    expect(await screen.findByRole('alert')).toHaveTextContent(/already has an account/i);
  });
});

describe('account-state errors on sign-up', () => {
  it('offers sign-in and password reset when the address is taken', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<SignUpPage />);

    await user.type(screen.getByLabelText('Email'), 'taken@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passphrase123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute(
      'href',
      '/reset-password',
    );

    // Choosing sign-in carries the address over, so they do not retype it.
    await user.click(within(alert).getByRole('link', { name: 'Sign in' }));
    expect(peekSignInHandoff()).toEqual({ email: 'taken@example.com' });
  });

  it('shows the password rules when the API rejects the password', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(api('/auth/signup'), () =>
        HttpResponse.json(
          {
            success: false,
            code: 'INVALID_PASSWORD',
            error: 'Password does not conform to policy',
          },
          { status: 400 },
        ),
      ),
    );
    await renderWithRouter(<SignUpPage />);

    await user.type(screen.getByLabelText('Email'), 'someone@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passphrase123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText(/does not meet the rules/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('sign-in against the API', () => {
  it('stores the address and routes to verification on USER_NOT_CONFIRMED', async () => {
    const user = userEvent.setup();
    let resendCalled = false;
    server.use(
      http.post(api('/auth/resend-code'), () => {
        resendCalled = true;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await renderWithRouter(<SignInPage />);
    await user.type(screen.getByLabelText('Email'), 'unconfirmed@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passphrase123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    // 403 USER_NOT_CONFIRMED is a step to resume, not an error to display.
    await expect.poll(() => getPendingEmail()).toBe('unconfirmed@example.com');
    await expect.poll(() => resendCalled).toBe(true);
  });

  it('shows the server message for bad credentials', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<SignInPage />);

    await user.type(screen.getByLabelText('Email'), 'someone@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    // Translated by code: the mock's English "Incorrect email or password."
    // must not reach the screen.
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password.');
  });

  it('reports a failed connection differently from a rejection', async () => {
    const user = userEvent.setup();
    server.use(http.post(api('/auth/signin'), () => HttpResponse.error()));

    await renderWithRouter(<SignInPage />);
    await user.type(screen.getByLabelText('Email'), 'someone@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passphrase123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    // "Could not reach the server" is actionable; "incorrect password" for an
    // offline device is actively misleading.
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  });
});
