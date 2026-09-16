import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IDLE_LIMIT_MS, recordActivity } from '@/lib/auth/idle';
import { resetSessionStateForTests } from '@/lib/auth/session';
import { clearTokens, hasSessionMarker, setTokens } from '@/lib/auth/token-store';
import { makeJwt, nowInSeconds } from '@/mocks/handlers';
import { renderWithRouter } from '@/test/router';

import { IdleSignOut } from './IdleSignOut';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  clearTokens();
  resetSessionStateForTests();
  setTokens({ idToken: makeJwt({ exp: nowInSeconds() + 3600 }), signedIn: true });
});

afterEach(() => {
  vi.useRealTimers();
  clearTokens();
});

describe('IdleSignOut', () => {
  it('stays quiet while there has been recent activity', async () => {
    const onSignedOut = vi.fn();
    await renderWithRouter(<IdleSignOut onSignedOut={onSignedOut} />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onSignedOut).not.toHaveBeenCalled();
  });

  it('warns in the last minute and lets them stay signed in', async () => {
    recordActivity(Date.now() - IDLE_LIMIT_MS + 30_000, { force: true });
    const onSignedOut = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderWithRouter(<IdleSignOut onSignedOut={onSignedOut} />);

    expect(await screen.findByRole('alertdialog', { name: 'Still there?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Stay signed in' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onSignedOut).not.toHaveBeenCalled();
    expect(hasSessionMarker()).toBe(true);
  });

  it('signs out once the 30 minutes are up', async () => {
    recordActivity(Date.now() - IDLE_LIMIT_MS - 1000, { force: true });
    const onSignedOut = vi.fn();
    await renderWithRouter(<IdleSignOut onSignedOut={onSignedOut} />);

    expect(onSignedOut).toHaveBeenCalledTimes(1);
    expect(hasSessionMarker()).toBe(false);
  });
});
