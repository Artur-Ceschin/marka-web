import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { PageLoader } from './PageLoader';

describe('PageLoader', () => {
  it('announces loading to assistive tech', async () => {
    await renderWithRouter(<PageLoader />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('announces it in the active language', async () => {
    await renderWithRouter(<PageLoader />, { locale: 'pt-BR' });
    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderWithRouter(<PageLoader />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
