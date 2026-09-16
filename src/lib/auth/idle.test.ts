import { afterEach, describe, expect, it } from 'vitest';

import {
  clearActivity,
  IDLE_LIMIT_MS,
  isIdleExpired,
  lastActivity,
  msUntilIdle,
  recordActivity,
} from './idle';
import { clearTokens, setTokens } from './token-store';

afterEach(() => {
  clearActivity();
});

describe('idle tracking', () => {
  it('is not expired when no activity was ever recorded', () => {
    expect(isIdleExpired()).toBe(false);
    expect(msUntilIdle()).toBe(IDLE_LIMIT_MS);
  });

  it('expires 30 minutes after the last activity', () => {
    const start = 1_000_000;
    recordActivity(start, { force: true });

    expect(isIdleExpired(start + IDLE_LIMIT_MS - 1)).toBe(false);
    expect(isIdleExpired(start + IDLE_LIMIT_MS)).toBe(true);
  });

  it('throttles frequent writes', () => {
    recordActivity(10_000, { force: true });
    recordActivity(11_000);
    expect(lastActivity()).toBe(10_000);

    recordActivity(20_000);
    expect(lastActivity()).toBe(20_000);
  });

  it('starts fresh at sign-in and is cleared at sign-out', () => {
    recordActivity(1, { force: true });

    setTokens({ idToken: 'id', signedIn: true });
    expect(isIdleExpired()).toBe(false);

    clearTokens();
    expect(lastActivity()).toBeNull();
  });
});
