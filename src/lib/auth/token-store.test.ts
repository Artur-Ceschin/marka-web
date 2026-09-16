import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearTokens,
  getIdToken,
  hasSessionMarker,
  setTokens,
  subscribeTokens,
} from './token-store';

afterEach(() => {
  clearTokens();
});

describe('token store subscriptions', () => {
  it('notifies subscribers when tokens are set and cleared', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTokens(listener);

    setTokens({ idToken: 'id', signedIn: true });
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

  it('signs this tab out when another tab signs out', () => {
    const unsubscribe = subscribeTokens(() => undefined);
    setTokens({ idToken: 'id', signedIn: true });

    // What another tab signing out looks like from here: a storage event for
    // the session marker, with the value removed.
    window.dispatchEvent(new StorageEvent('storage', { key: 'marka-session', newValue: null }));

    expect(getIdToken()).toBeNull();
    unsubscribe();
  });
});

describe('what this browser stores', () => {
  it('keeps no token anywhere script can read it back', () => {
    setTokens({ idToken: 'secret-id-token', accessToken: 'secret-access-token', signedIn: true });

    const stored = Object.keys(localStorage)
      .map((key) => localStorage.getItem(key))
      .join(' ');

    // The refresh token is an httpOnly cookie; the rest stays in memory.
    expect(stored).not.toContain('secret-');
    expect(hasSessionMarker()).toBe(true);
  });

  it('starts a session only on sign-in, not on a refresh', () => {
    setTokens({ idToken: 'id' });

    expect(hasSessionMarker()).toBe(false);
  });

  it('forgets the session on sign-out', () => {
    setTokens({ idToken: 'id', signedIn: true });

    clearTokens();

    expect(hasSessionMarker()).toBe(false);
  });
});
