const STORAGE_KEY = 'marka-pending-verification';

/**
 * The address a verification code was just sent to.
 *
 * Deliberately NOT a URL parameter. An email address is personal data and a
 * query string ends up in browser history, server logs, referrer headers and
 * anything the user pastes to a friend.
 *
 * `sessionStorage` rather than `localStorage`: this is scoped to one sign-up
 * attempt and should not outlive the tab. It has to survive a reload, though,
 * because the whole point of this screen is that someone switches to their mail
 * app and comes back, which on mobile often means the page is reloaded.
 */
export function setPendingEmail(email: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, email);
  } catch {
    // Storage unavailable; the page will fall back to its empty state.
  }
}

export function getPendingEmail(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearPendingEmail(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
