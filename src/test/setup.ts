import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from 'vitest';

import { server } from '@/mocks/server';

// `error` rather than `warn`: a request the handlers do not cover means the
// test is exercising a path nobody modelled, and silently returning a network
// error would make that look like a UI bug.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

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

// jsdom knows <dialog> but not its methods. Enough of them to open and close
// it; focus trapping and inertness are the browser's job and not tested here.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype;
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (typeof proto.close !== 'function') {
    proto.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
      // Queued, as browsers do. Firing it synchronously hid a real bug: see Dialog.
      setTimeout(() => this.dispatchEvent(new Event('close')), 0);
    };
  }
}

beforeEach(() => {
  stubMatchMedia();
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  // A locale set by one test must not leak into the next.
  try {
    localStorage.clear();
  } catch {
    // Storage unavailable; nothing to clear.
  }
});
