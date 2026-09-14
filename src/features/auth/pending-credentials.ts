export interface PendingCredentials {
  email: string;
  password: string;
}

/**
 * The credentials typed at sign-up, held just long enough to sign in straight
 * after the email is verified, so a new user lands in the app instead of being
 * asked for the password they typed a minute ago.
 *
 * Memory only, deliberately. Never sessionStorage, localStorage or the URL: a
 * password written anywhere persistent outlives the moment it was needed and is
 * readable by any script on the origin. The cost is that a reload between
 * sign-up and verification forgets it, and the flow falls back to a normal
 * sign-in with the address prefilled. That is the right trade.
 */
let pending: PendingCredentials | null = null;

export function setPendingCredentials(credentials: PendingCredentials): void {
  pending = { ...credentials };
}

/**
 * Hands the credentials over once and forgets them, whether or not they match.
 * Only returned when they belong to the address being verified, so a password
 * left over from a different sign-up attempt is never tried.
 */
export function takePendingCredentials(email: string): PendingCredentials | null {
  const credentials = pending;
  pending = null;
  if (!credentials) return null;
  const same = credentials.email.trim().toLowerCase() === email.trim().toLowerCase();
  return same ? credentials : null;
}

export function clearPendingCredentials(): void {
  pending = null;
}
