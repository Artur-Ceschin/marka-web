import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { getPendingEmail } from '../pending-verification';
import { SignUpPage } from './SignUpPage';

function renderPage() {
  return renderWithRouter(<SignUpPage />);
}

async function submitWith(password: string) {
  const user = userEvent.setup();
  await renderPage();
  await user.type(screen.getByLabelText('Email'), 'person@example.com');
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Create account' }));
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('SignUpPage', () => {
  it('asks the password manager to generate a new password, not recall one', async () => {
    await renderPage();
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('states the password rules up front rather than after failure', async () => {
    await renderPage();
    expect(
      screen.getByText(
        'At least 8 characters, with an uppercase letter, a lowercase letter and a number.',
      ),
    ).toBeInTheDocument();
  });

  it('rejects a password shorter than 8 characters', async () => {
    await submitWith('Ab1');
    expect(await screen.findByText('Use at least 8 characters.')).toBeInTheDocument();
  });

  it('rejects a password with no number', async () => {
    await submitWith('Passwordonly');
    expect(await screen.findByText('Add a number.')).toBeInTheDocument();
  });

  it('rejects a password with no uppercase letter', async () => {
    await submitWith('password123');
    expect(await screen.findByText('Add an uppercase letter.')).toBeInTheDocument();
  });

  it('rejects a password with no lowercase letter', async () => {
    await submitWith('PASSWORD123');
    expect(await screen.findByText('Add a lowercase letter.')).toBeInTheDocument();
  });

  it('sends a password that meets the API rules', async () => {
    await submitWith('Passphrase123');
    // The form mirrors the API policy exactly, so a password it accepts is one
    // the server accepts too, and the flow reaches verification.
    await expect.poll(() => getPendingEmail()).toBe('person@example.com');
  });

  it('offers Google below the credential fields', async () => {
    await renderPage();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
