import { z } from 'zod';

import { API_ERROR_CODES, ApiError } from '../api-error';
import { config } from '../config';
import { request } from '../http';

import { challengeFromVerifier, createState, createVerifier, storePkce, takePkce } from './pkce';
import { setTokens } from './token-store';

/**
 * Google sign-in via the Cognito hosted UI, authorization code + PKCE.
 *
 * Both flows converge: this ends with the same id token the password flow
 * produces, and every request after that is identical. The API cannot tell them
 * apart and does not need to.
 */

/**
 * Why a Google sign-in did not finish.
 *
 * A reason rather than a message: the callback screen is rendered in the
 * person's own language, and an English string thrown from here could not be
 * translated. It also keeps text from the callback URL out of the UI.
 */
export type GoogleFailure = 'cancelled' | 'stale' | 'mismatch' | 'invalidCode' | 'failed';

export class GoogleSignInError extends Error {
  readonly reason: GoogleFailure;

  constructor(reason: GoogleFailure, cause?: unknown) {
    super(`Google sign-in failed: ${reason}`);
    this.name = 'GoogleSignInError';
    this.reason = reason;
    this.cause = cause;
  }
}

const sessionResponseSchema = z.object({
  idToken: z.string(),
  accessToken: z.string(),
  expiresIn: z.number(),
});

/** Sends the browser to Cognito. Does not return: the page navigates away. */
export async function startGoogleSignIn(): Promise<void> {
  const { domain, clientId, redirectUri } = config.cognito;
  if (!domain || !clientId || !redirectUri) {
    throw new Error('Google sign-in is not configured. Set the VITE_COGNITO_* variables.');
  }

  const verifier = createVerifier();
  const state = createState();
  storePkce(verifier, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile',
    // `identity_provider` skips the hosted UI's provider chooser and goes
    // straight to Google, which is the only provider we offer.
    identity_provider: 'Google',
    code_challenge_method: 'S256',
    code_challenge: await challengeFromVerifier(verifier),
    state,
  });

  window.location.assign(`https://${domain}/oauth2/authorize?${params.toString()}`);
}

/**
 * Completes the flow from the callback URL.
 *
 * The code goes to our API rather than straight to Cognito. Exchanging it here
 * would hand the refresh token to JavaScript; the API exchanges it and keeps
 * the refresh token in an httpOnly cookie instead. PKCE still holds: the
 * verifier leaves this browser once, over TLS, with a code that works once.
 */
export async function completeGoogleSignIn(search: string): Promise<void> {
  const params = new URLSearchParams(search);

  const error = params.get('error');
  if (error) {
    // Not `error_description`: it comes from the URL, so anyone can craft a
    // link that puts their own convincing message on our sign-in screen.
    throw new GoogleSignInError(error === 'access_denied' ? 'cancelled' : 'failed');
  }

  const code = params.get('code');
  const returnedState = params.get('state');
  const { verifier, state: expectedState } = takePkce();

  if (!code) throw new GoogleSignInError('failed');
  // No verifier here means this browser never started the flow: another tab,
  // another device, or a link someone was sent.
  if (!verifier) throw new GoogleSignInError('stale');
  // The state check is what makes a forged callback URL useless: an attacker
  // cannot know the value we stored before redirecting.
  if (!expectedState || returnedState !== expectedState) {
    throw new GoogleSignInError('mismatch');
  }

  let tokens: z.infer<typeof sessionResponseSchema>;
  try {
    tokens = await request('/auth/google', {
      method: 'POST',
      // redirectUri must match the authorize call exactly, or Cognito refuses.
      body: { code, codeVerifier: verifier, redirectUri: config.cognito.redirectUri },
      schema: sessionResponseSchema,
    });
  } catch (cause) {
    // A code works once and expires fast, so a reload of this page or a back
    // button onto it spends one that is already gone. There is nothing to
    // retry here: the whole flow has to start again from sign-in.
    if (cause instanceof ApiError && cause.code === API_ERROR_CODES.invalidAuthorizationCode) {
      throw new GoogleSignInError('invalidCode', cause);
    }
    throw new GoogleSignInError('failed', cause);
  }

  // The refresh token came back as an httpOnly cookie, which scripts cannot
  // read: nothing to keep here but the marker that a session exists.
  setTokens({ ...tokens, signedIn: true });
}
