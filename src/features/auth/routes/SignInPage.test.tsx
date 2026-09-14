import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { SignInPage } from './SignInPage';

function renderPage() {
  return renderWithRouter(<SignInPage />);
}

describe('SignInPage', () => {
  it('labels both fields so they are reachable by name', async () => {
    await renderPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('gives password managers the autocomplete hints they need', async () => {
    await renderPage();
    // `username` + `current-password` is the pair a manager looks for to offer
    // a saved login. `email` on its own does not trigger it.
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('uses a real email input so mobile shows the right keyboard', async () => {
    await renderPage();
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('inputmode', 'email');
    // Autocorrect would silently mangle an address on iOS.
    expect(email).toHaveAttribute('spellcheck', 'false');
  });

  it('offers a Google button below the credentials', async () => {
    await renderPage();
    const google = screen.getByRole('button', { name: /continue with google/i });
    expect(google).toBeInTheDocument();

    // Assert the ORDER: the brief puts Google beneath email and password.
    const password = screen.getByLabelText('Password');
    const position = password.compareDocumentPosition(google);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps the submit button enabled before a request starts', async () => {
    await renderPage();
    // Disabling until valid leaves people poking a dead button with no
    // explanation of what is wrong.
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('shows an inline error and marks the field invalid on empty submit', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects a malformed address with a different message', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'whatever');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText(/does not look like an email address/i)).toBeInTheDocument();
  });

  it('toggles password visibility without losing the value', async () => {
    const user = userEvent.setup();
    await renderPage();

    const password = screen.getByLabelText('Password');
    await user.type(password, 'hunter2hunter2');
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(password).toHaveValue('hunter2hunter2');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
