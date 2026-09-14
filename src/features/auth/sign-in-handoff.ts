const STORAGE_KEY = 'marka-sign-in-handoff';

export type SignInNotice = 'verified' | 'passwordReset';

export interface SignInHandoff {
  email: string;
  notice: SignInNotice;
}

/**
 * What a previous step passes to the sign-in screen: the address to prefill and
 * why the person has landed there.
 *
 * `sessionStorage`, not the URL, for the same reason as the pending
 * verification address: an email address is personal data and a query string
 * ends up in history, logs and anything pasted to someone else.
 */
export function setSignInHandoff(handoff: SignInHandoff): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(handoff));
  } catch {
    // Storage unavailable: sign-in simply opens without a prefill.
  }
}

export function peekSignInHandoff(): SignInHandoff | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    // Validated rather than cast: storage is writable by anything on the
    // origin, and a malformed value must not break the sign-in screen.
    if (
      typeof value === 'object' &&
      value !== null &&
      'email' in value &&
      'notice' in value &&
      typeof value.email === 'string' &&
      (value.notice === 'verified' || value.notice === 'passwordReset')
    ) {
      return { email: value.email, notice: value.notice };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSignInHandoff(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
