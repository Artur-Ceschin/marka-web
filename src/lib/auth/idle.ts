/**
 * When this person last did something, shared by every open tab.
 *
 * Stored in localStorage rather than memory so that reading in one tab keeps
 * the others signed in, and so that reopening the app after a long gap can
 * tell the limit passed even though no timer ran while it was closed.
 */

const STORAGE_KEY = 'marka-last-activity';

export const IDLE_LIMIT_MS = 30 * 60_000;
/** How long before sign-out the warning appears. */
export const IDLE_WARNING_MS = 60_000;

// Pointer moves fire dozens of times a second; one write every few seconds
// is plenty for a limit measured in minutes.
const WRITE_EVERY_MS = 5_000;

let lastWrite = 0;
// Used only when storage is unavailable (a private window, blocked storage).
let fallback: number | null = null;

export function recordActivity(at: number = Date.now(), { force = false } = {}): void {
  if (!force && at - lastWrite < WRITE_EVERY_MS) return;
  lastWrite = at;
  fallback = at;
  try {
    localStorage.setItem(STORAGE_KEY, String(at));
  } catch {
    // The in-memory fallback covers this tab.
  }
}

export function lastActivity(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const value = Number(raw);
      if (Number.isFinite(value)) return value;
    }
  } catch {
    // Fall through to memory.
  }
  return fallback;
}

/** Milliseconds left before the idle limit. Never recorded counts as fresh. */
export function msUntilIdle(now: number = Date.now()): number {
  const last = lastActivity();
  return last === null ? IDLE_LIMIT_MS : IDLE_LIMIT_MS - (now - last);
}

export function isIdleExpired(now: number = Date.now()): boolean {
  const last = lastActivity();
  return last !== null && now - last >= IDLE_LIMIT_MS;
}

export function clearActivity(): void {
  lastWrite = 0;
  fallback = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
