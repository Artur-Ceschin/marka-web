import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { TriangleAlert } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

import type { AuthValues } from '../schemas';
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
  onSubmit: (values: AuthValues) => Promise<void>;
  onGoogle: () => void;
}

export function AuthForm({
  schema,
  submitLabel,
  passwordAutoComplete,
  passwordHint,
  showForgotLink = false,
  onSubmit,
  onGoogle,
}: AuthFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    // Zod is a Standard Schema implementation, so TanStack Form consumes it
    // directly. `onSubmit` rather than `onChange`: validating every keystroke
    // shouts at someone for a half-typed email they are still writing.
    validators: { onSubmit: schema, onBlur: schema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await onSubmit(value);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        );
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
        {formError ? (
          <p id={formErrorId} className={styles.formError} role="alert">
            <TriangleAlert className={styles.formErrorIcon} aria-hidden="true" />
            <span>{formError}</span>
          </p>
        ) : null}

        <form.Field name="email">
          {(field) => (
            <Field
              label="Email"
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
              placeholder="you@example.com"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field
              label="Password"
              type="password"
              name="password"
              autoComplete={passwordAutoComplete}
              revealable
              spellCheck={false}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              error={field.state.meta.errors[0]?.message}
              hint={passwordHint}
              labelAside={
                showForgotLink ? (
                  <Link to="/reset-password" className={styles.forgot}>
                    Forgot your password?
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
                {isSubmitting ? 'Just a moment…' : submitLabel}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>

      <OAuthDivider />
      <GoogleButton onClick={onGoogle} />
    </>
  );
}
