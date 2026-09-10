import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, expect, vi } from 'vitest';

// Adds `expect(...).toHaveNoViolations()`. Every component test asserts this,
// so registering it once here keeps it out of the individual files.
expect.extend(toHaveNoViolations);

// --- Browser APIs jsdom does not implement -------------------------------
// Both are real APIs the app depends on, not incidental ones: matchMedia backs
// the initial theme and the reduced-motion checks, IntersectionObserver drives
// the header's scrolled state. Stub them once rather than in every test.

/** Defaults to "no match", i.e. the light theme and no reduced-motion request. */
function stubMatchMedia(matches = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  // Part of the current spec, so `implements IntersectionObserver` requires it.
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  stubMatchMedia();
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
