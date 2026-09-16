import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/app/providers/I18nProvider';

import { Dialog } from './Dialog';

describe('Dialog', () => {
  // Regression: StrictMode's development remount queued a close event that
  // arrived after the dialog reopened, and every dialog vanished on open.
  it('stays open through a StrictMode remount', async () => {
    const onClose = vi.fn();
    render(
      <StrictMode>
        <I18nProvider>
          <Dialog open title="Edit plant" onClose={onClose}>
            <p>Body</p>
          </Dialog>
        </I18nProvider>
      </StrictMode>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Edit plant' })).toHaveAttribute('open');
  });

  it('reports a close that really happened, such as Escape', async () => {
    const onClose = vi.fn();
    render(
      <I18nProvider>
        <Dialog open title="Edit plant" onClose={onClose}>
          <p>Body</p>
        </Dialog>
      </I18nProvider>,
    );

    await act(async () => {
      (screen.getByRole('dialog') as HTMLDialogElement).close();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
