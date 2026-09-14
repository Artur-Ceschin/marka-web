import { z } from 'zod';

import { config } from '../config';

import { challengeFromVerifier, createState, createVerifier, storePkce, takePkce } from './pkce';
import { setTokens } from './token-store';

/**
 * Google sign-in via the Cognito hosted UI, authorization code + PKCE.
 *
 * Both flows converge: this ends with the same id token the password flow
 * produces, and every request after that is identical. The API cannot tell them
 * apart and does not need to.
 */

const tokenResponseSchema = z.object({
  id_token: z.string(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
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
 * The token exchange goes directly to Cognito rather than through our API,
 * because the verifier never leaves this browser. There is no client secret to
 * protect, which is the whole point of PKCE.
 */
export async function completeGoogleSignIn(search: string): Promise<void> {
  const params = new URLSearchParams(search);

  const error = params.get('error');
  if (error) {
    throw new Error(params.get('error_description') ?? error);
  }

  const code = params.get('code');
  const returnedState = params.get('state');
  const { verifier, state: expectedState } = takePkce();

  if (!code) throw new Error('The sign-in response had no authorization code.');
  if (!verifier) throw new Error('This sign-in was started in a different tab or session.');
  // The state check is what makes a forged callback URL useless: an attacker
  // cannot know the value we stored before redirecting.
  if (!expectedState || returnedState !== expectedState) {
    throw new Error('The sign-in response did not match this session.');
  }

  const { domain, clientId, redirectUri } = config.cognito;
  const response = await fetch(`https://${domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      // Sent again and must match the authorize call exactly; Cognito rejects
      // the exchange otherwise.
      redirect_uri: redirectUri,
      code,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    throw new Error('Could not complete Google sign-in. Please try again.');
  }

  const parsed = tokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error('Google sign-in returned an unexpected response.');
  }

  setTokens({
    idToken: parsed.data.id_token,
    accessToken: parsed.data.access_token,
    ...(parsed.data.refresh_token ? { refreshToken: parsed.data.refresh_token } : {}),
  });
}
