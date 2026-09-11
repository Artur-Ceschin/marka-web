import { z } from 'zod';

/**
 * Auth form shapes.
 *
 * These will be shared with the Lambda backend, so the messages are written to
 * be shown to a person rather than logged: each one says what to do next, not
 * merely what is wrong.
 */

// `.pipe(z.email())` rather than the deprecated `.string().email()`, and the
// order matters: trim and the presence check run first so an empty box says
// "Enter your email address" instead of "that is not an email address".
const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .pipe(z.email('That does not look like an email address. Check for a typo.'));

export const signInSchema = z.object({
  email,
  // Deliberately only a presence check. Telling someone their *existing*
  // password is too short is useless: they cannot change what they already
  // have, and the rules may have changed since they signed up.
  password: z.string().min(1, 'Enter your password.'),
});

/**
 * Length is the single strongest factor in password strength, so the minimum is
 * 12 rather than the traditional 8, and there are no composition rules. NIST
 * SP 800-63B recommends exactly this: require length, drop the
 * "one uppercase, one symbol" theatre that pushes people towards `Passw0rd!`.
 */
export const signUpSchema = z.object({
  email,
  password: z
    .string()
    .min(12, 'Use at least 12 characters. Length matters more than symbols.')
    .max(128, 'That is longer than 128 characters.'),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

/** Both forms carry the same fields; only the password rule differs. */
export type AuthValues = SignInValues;
