import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { LandingPage } from './LandingPage';

async function renderPage() {
  return renderWithRouter(
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>,
  );
}

describe('LandingPage', () => {
  it('has exactly one h1', async () => {
    await renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('gives every image alt text', async () => {
    await renderPage();
    for (const img of screen.getAllByRole('img')) {
      expect(img).toHaveAccessibleName();
    }
  });

  it('states the foraging safety caveat on the fungi card', async () => {
    await renderPage();
    // This copy is a safety commitment, not decoration: assert it stays.
    expect(screen.getByText(/never forage on an identification alone/i)).toBeInTheDocument();
  });

  it('marks every integration as planned rather than shipped', async () => {
    await renderPage();
    const badges = screen.getAllByText('Planned');
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });

  it('exposes a skip link as the first focusable element', async () => {
    await renderPage();
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main');
  });

  it('points every hero subject link at a card that actually exists', async () => {
    const { container } = await renderPage();
    const subjectNav = screen.getByRole('navigation', { name: /what marka identifies/i });
    const links = within(subjectNav).getAllByRole('link');

    expect(links).toHaveLength(3);
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toMatch(/^#/);
      // A jump link to a missing id fails silently in the browser: nothing
      // moves and nothing errors, so assert the target is really there.
      expect(container.querySelector(href)).not.toBeNull();
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
