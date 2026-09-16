import { z } from 'zod';

import { authorizedRequest } from '@/lib/auth/session';
import { setTokens } from '@/lib/auth/token-store';
import { request } from '@/lib/http';

/**
 * The auth endpoints.
 *
 * Plain JSON against our own API: no Cognito SDK and no hosted domain involved
 * for the email and password flow. Only the Google flow touches the domain.
 */

export const signInResponseSchema = z.object({
  idToken: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type SignInResponse = z.infer<typeof signInResponseSchema>;

export const profileSchema = z.object({
  userId: z.string(),
  email: z.string(),
  /** Only present for Google accounts; email sign-up never asks for a name. */
  name: z.string().optional(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

/**
 * The signed-in user's profile.
 *
 * `userId` is the same whether they signed in with email or Google, which is
 * also the quickest way to confirm a linked Google account is one user.
 */
export function getMe(): Promise<Profile> {
  return authorizedRequest('/me', { schema: profileSchema });
}

/** 201 on success. 409 means the address already has an account. */
export async function signUp(input: { email: string; password: string }): Promise<void> {
  await request('/auth/signup', { method: 'POST', body: input });
}

/** 200 on success. The user supplies only the code; we carry the email. */
export async function confirmSignUp(input: { email: string; code: string }): Promise<void> {
  await request('/auth/confirm', { method: 'POST', body: input });
}

export async function resendCode(input: { email: string }): Promise<void> {
  await request('/auth/resend-code', { method: 'POST', body: input });
}

/**
 * 403 USER_NOT_CONFIRMED means the account exists but was never verified; the
 * caller should route back to the code screen rather than show a form error.
 */
export async function signIn(input: { email: string; password: string }): Promise<SignInResponse> {
  const tokens = await request('/auth/signin', {
    method: 'POST',
    body: input,
    schema: signInResponseSchema,
  });
  setTokens(tokens);
  return tokens;
}

export async function forgotPassword(input: { email: string }): Promise<void> {
  await request('/auth/forgot-password', { method: 'POST', body: input });
}

export async function resetPassword(input: {
  email: string;
  code: string;
  password: string;
}): Promise<void> {
  await request('/auth/reset-password', { method: 'POST', body: input });
}
