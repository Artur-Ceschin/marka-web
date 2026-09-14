import { z } from 'zod';

import type { Messages } from '@/lib/i18n';

/**
 * Auth form shapes.
 *
 * Factories rather than constants: a Zod schema bakes its messages in at
 * construction, so a module-level schema would be frozen in whichever language
 * happened to load first. Building them per locale is what makes validation
 * errors translate.
 *
 * Messages are written to be read by a person: each says what to do next, not
 * merely what is wrong.
 */

// `.pipe(z.email())` rather than the deprecated `.string().email()`, and the
// order matters: trim and the presence check run first so an empty box says
// "enter your email" instead of "that is not an email address".
const emailField = (m: Messages) =>
  z.string().trim().min(1, m.validation.emailRequired).pipe(z.email(m.validation.emailInvalid));

/**
 * A password being CREATED, on sign-up or reset.
 *
 * Mirrors the API exactly: 8 or more characters with an uppercase letter, a
 * lowercase letter and a digit. The client is not the authority here, the
 * Cognito pool policy is. A client rule looser than the server lets people
 * submit passwords that bounce; a stricter one rejects passwords the server
 * would accept. Matching it means every rejection happens inline, before the
 * request, with a message naming the one part that is missing.
 *
 * Only the first failure is shown, so the message is always a single concrete
 * next step rather than a checklist.
 */
const newPasswordField = (m: Messages) =>
  z
    .string()
    .min(8, m.validation.passwordTooShort)
    .regex(/[a-z]/, m.validation.passwordNeedsLower)
    .regex(/[A-Z]/, m.validation.passwordNeedsUpper)
    .regex(/\d/, m.validation.passwordNeedsDigit);

/** Cognito confirmation codes are six digits. */
const codeField = (m: Messages) =>
  z
    .string()
    .trim()
    .min(1, m.validation.codeRequired)
    .regex(/^\d{6}$/, m.validation.codeInvalid);

export const createSignInSchema = (m: Messages) =>
  z.object({
    email: emailField(m),
    // Deliberately only a presence check. Telling someone their EXISTING
    // password is too short is useless: they cannot change what they already
    // have, and the rules may have changed since they signed up.
    password: z.string().min(1, m.validation.passwordRequired),
  });

export const createSignUpSchema = (m: Messages) =>
  z.object({
    email: emailField(m),
    password: newPasswordField(m),
  });

export const createVerificationSchema = (m: Messages) =>
  z.object({
    code: codeField(m),
  });

export const createForgotPasswordSchema = (m: Messages) =>
  z.object({
    email: emailField(m),
  });

export const createResetPasswordSchema = (m: Messages) =>
  z.object({
    code: codeField(m),
    password: newPasswordField(m),
  });

export type AuthValues = { email: string; password: string };
export type VerificationValues = { code: string };
