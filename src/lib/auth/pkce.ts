/**
 * PKCE helpers (RFC 7636).
 *
 * PKCE exists because a browser app cannot keep a client secret. Instead it
 * invents a random `code_verifier`, sends only its SHA-256 hash (the
 * `code_challenge`) to the authorize endpoint, and presents the original
 * verifier when exchanging the code. An attacker who intercepts the redirect
 * gets a code they cannot redeem, because they never saw the verifier.
 */

const VERIFIER_KEY = 'marka-pkce-verifier';
const STATE_KEY = 'marka-oauth-state';

/** Base64url: the URL-safe alphabet, with padding stripped. */
function base64UrlEncode(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  // crypto.getRandomValues, never Math.random: this value is the only thing
  // standing between an intercepted code and a stolen session.
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

export function createVerifier(): string {
  // 32 bytes becomes 43 base64url characters, the RFC's minimum length.
  return randomString(32);
}

export async function challengeFromVerifier(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

export function createState(): string {
  return randomString(16);
}

/**
 * The verifier and state must survive a full page navigation to Cognito and
 * back, so they cannot live in memory. `sessionStorage` keeps them to this tab
 * and this session, and they are deleted the moment they are read.
 */
export function storePkce(verifier: string, state: string): void {
  try {
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
  } catch {
    // Without storage the callback cannot complete; it reports that clearly.
  }
}

export function takePkce(): { verifier: string | null; state: string | null } {
  try {
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    const state = sessionStorage.getItem(STATE_KEY);
    // Single use. Leaving them behind would let a replayed callback URL run the
    // exchange a second time.
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    return { verifier, state };
  } catch {
    return { verifier: null, state: null };
  }
}
