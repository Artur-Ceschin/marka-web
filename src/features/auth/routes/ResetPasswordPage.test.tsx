import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { config } from '@/lib/config';
import { server } from '@/mocks/server';
import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { peekSignInHandoff } from '../sign-in-handoff';
import { ResetPasswordPage } from './ResetPasswordPage';

const api = (path: string) => `${config.apiUrl}${path}`;

async function goToResetStep(email = 'person@example.com') {
  const user = userEvent.setup();
  await renderWithRouter(<ResetPasswordPage />);
  await user.type(screen.getByLabelText('Email'), email);
  await user.click(screen.getByRole('button', { name: 'Send code' }));
  await screen.findByLabelText(/verification code/i);
  return user;
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('ResetPasswordPage', () => {
  it('validates the address before calling the API', async () => {
    const user = userEvent.setup();
    let called = false;
    server.use(
      http.post(api('/auth/forgot-password'), () => {
        called = true;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await renderWithRouter(<ResetPasswordPage />);
    await user.click(screen.getByRole('button', { name: 'Send code' }));

    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it('requests a code and moves to the reset step', async () => {
    let sent: unknown = null;
    server.use(
      http.post(api('/auth/forgot-password'), async ({ request }) => {
        sent = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await goToResetStep('person@example.com');

    expect(sent).toEqual({ email: 'person@example.com' });
    expect(screen.getByText('person@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('New password')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('holds the new password to the same rules as sign-up', async () => {
    const user = await goToResetStep();

    await user.type(screen.getByLabelText(/verification code/i), '123456');
    await user.type(screen.getByLabelText('New password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Set new password' }));

    expect(await screen.findByText('Use at least 8 characters.')).toBeInTheDocument();
  });

  it('resets the password and hands the address to sign-in', async () => {
    let sent: unknown = null;
    server.use(
      http.post(api('/auth/reset-password'), async ({ request }) => {
        sent = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const user = await goToResetStep('person@example.com');
    await user.type(screen.getByLabelText(/verification code/i), '123456');
    await user.type(screen.getByLabelText('New password'), 'Newpassword1');
    await user.click(screen.getByRole('button', { name: 'Set new password' }));

    await expect
      .poll(() => sent)
      .toEqual({ email: 'person@example.com', code: '123456', password: 'Newpassword1' });
    // Sign-in opens prefilled, with a note that the password changed.
    await expect
      .poll(() => peekSignInHandoff())
      .toEqual({ email: 'person@example.com', notice: 'passwordReset' });
  });

  it('shows a rejected code against the code field', async () => {
    const user = await goToResetStep();

    await user.type(screen.getByLabelText(/verification code/i), '000000');
    await user.type(screen.getByLabelText('New password'), 'Newpassword1');
    await user.click(screen.getByRole('button', { name: 'Set new password' }));

    expect(await screen.findByText('That code is not valid.')).toBeInTheDocument();
  });

  it('lets someone go back and use a different address', async () => {
    const user = await goToResetStep();

    await user.click(screen.getByRole('button', { name: 'Use a different address' }));

    expect(screen.getByRole('button', { name: 'Send code' })).toBeInTheDocument();
  });

  it('has no accessibility violations on the first step', async () => {
    const { container } = await renderWithRouter(<ResetPasswordPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
