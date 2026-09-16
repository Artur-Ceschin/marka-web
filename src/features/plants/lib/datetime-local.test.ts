import { describe, expect, it } from 'vitest';

import { fromLocalInputValue, isInFuture, toLocalInputValue } from './datetime-local';

describe('datetime-local conversions', () => {
  it('round-trips an instant through the input value', () => {
    const iso = '2026-09-13T19:20:00.000Z';
    const back = fromLocalInputValue(toLocalInputValue(iso));

    expect(back).not.toBeNull();
    expect(new Date(back as string).getTime()).toBe(new Date(iso).getTime());
  });

  it('always sends an explicit offset, which the API requires', () => {
    expect(fromLocalInputValue('2026-09-13T16:20')).toMatch(/^2026-09-13T16:20:00[+-]\d{2}:\d{2}$/);
  });

  it('treats an empty or broken value as no date', () => {
    expect(fromLocalInputValue('')).toBeNull();
    expect(fromLocalInputValue('not a date')).toBeNull();
    expect(toLocalInputValue(undefined)).toBe('');
    expect(toLocalInputValue('nonsense')).toBe('');
  });

  it('knows a future date from a past one', () => {
    const now = new Date('2026-09-14T12:00:00Z').getTime();
    expect(isInFuture('2999-01-01T00:00', now)).toBe(true);
    expect(isInFuture('2020-01-01T00:00', now)).toBe(false);
  });
});
