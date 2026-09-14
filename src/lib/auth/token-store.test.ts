import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearTokens, getIdToken, setTokens, subscribeTokens } from './token-store';

afterEach(() => {
  clearTokens();
});

describe('token store subscriptions', () => {
  it('notifies subscribers when tokens are set and cleared', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTokens(listener);

    setTokens({ idToken: 'id', refreshToken: 'refresh' });
    clearTokens();

    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    subscribeTokens(listener)();

    setTokens({ idToken: 'id' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('signs this tab out when another tab removes the refresh token', () => {
    const unsubscribe = subscribeTokens(() => undefined);
    setTokens({ idToken: 'id', refreshToken: 'refresh' });

    // What another tab signing out looks like from here: a storage event for
    // the refresh-token key, with the value removed.
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'marka-refresh-token', newValue: null }),
    );

    expect(getIdToken()).toBeNull();
    unsubscribe();
  });
});
