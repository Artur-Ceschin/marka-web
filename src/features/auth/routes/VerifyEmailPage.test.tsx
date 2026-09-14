import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { setPendingEmail } from '../pending-verification';

import { VerifyEmailPage } from './VerifyEmailPage';

const EMAIL = 'person@example.com';

function renderPage() {
  return renderWithRouter(<VerifyEmailPage />);
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setPendingEmail(EMAIL);
  });

  it('shows which address the code went to', async () => {
    await renderPage();
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.getByText(/six-digit code/i)).toBeInTheDocument();
  });

  it('exposes ONE labelled input, not six unlabelled ones', async () => {
    await renderPage();
    // Six separate boxes would announce as six anonymous fields and break
    // paste and OS autofill. The boxes on screen are decoration.
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(1);
    expect(screen.getByLabelText(/verification code/i)).toBe(inputs[0]);
  });

  it('asks the OS for the emailed code via autocomplete', async () => {
    await renderPage();
    const input = screen.getByLabelText(/verification code/i);
    // This attribute is what makes iOS offer the code from Mail.
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    // No maxLength on purpose: the browser applies it to the raw value before
    // separators are stripped, which silently eats a digit from a pasted
    // "123 456". Length is capped after cleaning instead.
    expect(input).not.toHaveAttribute('maxlength');
  });

  it('caps the code at six digits even when more are typed', async () => {
    const user = userEvent.setup();
    await renderPage();
    const input = screen.getByLabelText<HTMLInputElement>(/verification code/i);

    await user.type(input, '123456789');
    expect(input.value).toBe('123456');
  });

  it('accepts a pasted code, including one with stray characters', async () => {
    const user = userEvent.setup();
    await renderPage();
    const input = screen.getByLabelText<HTMLInputElement>(/verification code/i);

    await user.click(input);
    await user.paste('123 456');

    // Non-digits are stripped rather than rejected, so pasting from an email
    // that wrapped the code in text still works.
    expect(input.value).toBe('123456');
  });

  it('ignores letters typed into the field', async () => {
    const user = userEvent.setup();
    await renderPage();
    const input = screen.getByLabelText<HTMLInputElement>(/verification code/i);

    await user.type(input, '12ab34');
    expect(input.value).toBe('1234');
  });

  it('keeps submit disabled while the code is incomplete', async () => {
    const user = userEvent.setup();
    await renderPage();

    const submit = screen.getByRole('button', { name: /verify email/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/verification code/i), '12345');
    expect(submit).toBeDisabled();
  });

  it('submits on its own once the sixth digit arrives', async () => {
    const user = userEvent.setup();
    await renderPage();

    // A code the server rejects. Reaching the server at all is the proof that
    // completion submitted without anyone pressing the button; a code that
    // succeeds navigates away too quickly to observe.
    await user.type(screen.getByLabelText(/verification code/i), '999999');

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid verification code/i);
  });

  it('surfaces the server message rather than a generic one', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.type(screen.getByLabelText(/verification code/i), '111111');

    // The server knows whether a code was wrong or merely stale, so its
    // wording beats anything we could guess at.
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid verification code.');
  });

  it('starts the resend link on a cooldown so it cannot be hammered', async () => {
    await renderPage();
    const resend = screen.getByRole('button', { name: /you can ask for a new code/i });
    expect(resend).toBeDisabled();
  });

  it('announces code progress for people who cannot see the boxes', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.type(screen.getByLabelText(/verification code/i), '123');
    // The digits render inside aria-hidden boxes, so this live region is the
    // only feedback a screen reader gets.
    expect(screen.getByText('3 of 6 digits entered')).toBeInTheDocument();
  });

  it('offers a way out when there is no pending sign-up', async () => {
    sessionStorage.clear();
    await renderPage();

    expect(screen.getByRole('heading', { name: /nothing to verify/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute(
      'href',
      '/sign-up',
    );
    expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
