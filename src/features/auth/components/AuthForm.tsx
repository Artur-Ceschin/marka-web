import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { Check, TriangleAlert } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';
import type { z } from 'zod';
import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { startGoogleSignIn } from '@/lib/auth/google';
import { isGoogleSignInConfigured } from '@/lib/config';

import { type AuthErrorAction, describeAuthError } from '../error-messages';
import type { AuthValues } from '../schemas';
import { setSignInHandoff } from '../sign-in-handoff';
import styles from './AuthForm.module.scss';
import { GoogleButton, OAuthDivider } from './OAuthButtons';

/**
 * TanStack Form consumes a Standard Schema, which is generic over BOTH its
 * input and its output. Zod's signature is ZodType<Output, Input>, and both
 * arguments have to be supplied: `z.ZodType<AuthValues>` alone leaves the input
 * as `unknown`, which is not what the form holds, so it fails to match.
 */
type AuthSchema = z.ZodType<AuthValues, AuthValues>;

interface AuthFormProps {
  schema: AuthSchema;
  submitLabel: string;
  /** `current-password` when signing in, `new-password` when registering. */
  passwordAutoComplete: 'current-password' | 'new-password';
  passwordHint?: string;
  showForgotLink?: boolean;
  /** Prefills the address, e.g. after verifying it or resetting a password. */
  defaultEmail?: string | undefined;
  /** A confirmation carried over from the previous step. */
  notice?: string | undefined;
  onSubmit: (values: AuthValues) => Promise<void>;
}

export function AuthForm({
  schema,
  submitLabel,
  passwordAutoComplete,
  passwordHint,
  showForgotLink = false,
  defaultEmail,
  notice,
  onSubmit,
}: AuthFormProps) {
  const { m } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);
  // A next step offered inside the error banner, and the address it applies to.
  const [formAction, setFormAction] = useState<AuthErrorAction | null>(null);
  const [actionEmail, setActionEmail] = useState('');
  // Field errors the SERVER produced, keyed by field name. Kept separate from
  // the Zod errors so a rule the client does not know about still lands next
  // to the input that caused it, and clears as soon as that input changes.
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});

  /**
   * Drops the server error for one field.
   *
   * A server error describes the value that was submitted, so the moment that
   * value changes the message no longer applies and must not sit there
   * contradicting what is on screen.
   */
  const clearServerError = useCallback((field: 'email' | 'password') => {
    setServerFieldErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);
  const formErrorId = useId();
  const googleAvailable = isGoogleSignInConfigured();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    defaultValues: { email: defaultEmail ?? '', password: '' },
    // Zod is a Standard Schema implementation, so TanStack Form consumes it
    // directly. `onSubmit` rather than `onChange`: validating every keystroke
    // shouts at someone for a half-typed email they are still writing.
    validators: { onSubmit: schema, onBlur: schema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFormAction(null);
      setServerFieldErrors({});
      try {
        await onSubmit(value);
      } catch (error) {
        const view = describeAuthError(error, m);
        const email = view.fields.email;
        const password = view.fields.password;
        if (email || password) {
          // A field problem is shown under that field, not as a banner.
          setServerFieldErrors({
            ...(email ? { email } : {}),
            ...(password ? { password } : {}),
          });
          return;
        }
        setFormError(view.message);
        setFormAction(view.action);
        setActionEmail(value.email);
      }
    },
  });

  return (
    <>
      <form
        ref={formRef}
        // `noValidate` hands validation to Zod. Without it the browser's own
        // bubbles fire first, in the browser's wording, and never reach a
        // screen reader in the way our inline messages do.
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit().then(() => {
            // Move focus to the first field that failed. Without this a
            // keyboard or screen-reader user submits and nothing appears to
            // happen, because the error sits well below their focus point.
            const firstInvalid =
              formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]');
            firstInvalid?.focus();
          });
        }}
        className={styles.form}
        aria-describedby={formError ? formErrorId : undefined}
      >
        {/* A status, not an alert: good news should be announced politely,
            and it gives way to an error rather than stacking above one. */}
        {notice && !formError ? (
          <p className={styles.notice} role="status">
            <Check className={styles.noticeIcon} aria-hidden="true" />
            <span>{notice}</span>
          </p>
        ) : null}

        {formError ? (
          <div id={formErrorId} className={styles.formError} role="alert">
            <TriangleAlert className={styles.formErrorIcon} aria-hidden="true" />
            <div className={styles.formErrorBody}>
              <span>{formError}</span>
              {/* An account-state error is a fork in the road, not a dead end,
                  so it carries the two ways forward. */}
              {formAction === 'signInOrReset' ? (
                <span className={styles.formErrorActions}>
                  <Link
                    to="/sign-in"
                    onClick={() => {
                      setSignInHandoff({ email: actionEmail });
                    }}
                  >
                    {m.auth.signInLink}
                  </Link>
                  <Link to="/reset-password">{m.auth.forgotPassword}</Link>
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <form.Field name="email">
          {(field) => (
            <Field
              label={m.auth.emailLabel}
              type="email"
              name="email"
              // `username` (not `email`) is what password managers look for to
              // pair with the password field and offer to save the login.
              autoComplete="username"
              inputMode="email"
              // An address is not a word: spellcheck and autocapitalise both
              // corrupt it, and on iOS the capital is applied silently.
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder={m.auth.emailPlaceholder}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
                clearServerError('email');
              }}
              error={field.state.meta.errors[0]?.message ?? serverFieldErrors.email}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field
              label={m.auth.passwordLabel}
              type="password"
              name="password"
              autoComplete={passwordAutoComplete}
              revealable
              spellCheck={false}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
                clearServerError('password');
              }}
              error={field.state.meta.errors[0]?.message ?? serverFieldErrors.password}
              hint={passwordHint}
              labelAside={
                showForgotLink ? (
                  <Link to="/reset-password" className={styles.forgot}>
                    {m.auth.forgotPassword}
                  </Link>
                ) : undefined
              }
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className={styles.submitRow}>
              {/* Stays enabled until the request actually starts: disabling on
                  invalid input leaves people poking a dead button with no
                  explanation of what is wrong. */}
              <Button type="submit" className={styles.submit} loading={isSubmitting}>
                {isSubmitting ? m.auth.submitting : submitLabel}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>

      {/* Hidden entirely when the build has no Cognito domain or client id,
          rather than offering a button that cannot work. */}
      {googleAvailable ? (
        <>
          <OAuthDivider />
          <GoogleButton
            onClick={() => {
              // Navigates away to the hosted UI, so there is no success path
              // to handle here: only a failure to even start.
              void startGoogleSignIn().catch(() => {
                setFormAction(null);
                setFormError(m.auth.googleFailed);
              });
            }}
          />
        </>
      ) : null}
    </>
  );
}
