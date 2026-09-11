import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { SignUpPage } from './SignUpPage';

function renderPage() {
  return renderWithRouter(
    <ThemeProvider>
      <SignUpPage />
    </ThemeProvider>,
  );
}

describe('SignUpPage', () => {
  it('asks the password manager to generate a new password, not recall one', async () => {
    await renderPage();
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('states the length requirement up front rather than after failure', async () => {
    await renderPage();
    expect(screen.getByText('At least 12 characters.')).toBeInTheDocument();
  });

  it('rejects a short password with an actionable message', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.type(screen.getByLabelText('Email'), 'person@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText(/at least 12 characters/i)).toBeInTheDocument();
  });

  it('accepts a long passphrase with no symbol requirements', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.type(screen.getByLabelText('Email'), 'person@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    // No composition rule should reject a long, memorable passphrase.
    expect(screen.queryByText(/at least 12 characters. Length matters/i)).not.toBeInTheDocument();
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
