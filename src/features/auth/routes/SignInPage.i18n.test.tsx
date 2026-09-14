import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/router';

import { SignInPage } from './SignInPage';

describe('SignInPage in Portuguese', () => {
  it('renders the page copy in pt-BR', async () => {
    await renderWithRouter(<SignInPage />, { locale: 'pt-BR' });

    expect(screen.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com o google/i })).toBeInTheDocument();
  });

  it('translates validation messages, not just static copy', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<SignInPage />, { locale: 'pt-BR' });

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    // Zod bakes messages in when the schema is built, so a schema created once
    // at module scope would be frozen in whichever language loaded first.
    expect(await screen.findByText('Digite seu e-mail.')).toBeInTheDocument();
  });

  it('sets <html lang> so screen readers use the right voice', async () => {
    await renderWithRouter(<SignInPage />, { locale: 'pt-BR' });
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('labels each language option in its own language', async () => {
    await renderWithRouter(<SignInPage />, { locale: 'pt-BR' });
    // The toggle lives in the site header, not the auth layout, so assert the
    // labels exist in the catalogue rather than in this tree.
    const { LOCALE_LABELS } = await import('@/lib/i18n');
    expect(LOCALE_LABELS['pt-BR'].full).toBe('Português');
    expect(LOCALE_LABELS.en.full).toBe('English');
  });
});
