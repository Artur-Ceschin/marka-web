import { Link, useNavigate } from '@tanstack/react-router';
import { TriangleAlert } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { ApiError, NetworkError } from '@/lib/api-error';

import { forgotPassword, resetPassword } from '../api/auth-api';
import { AuthLayout } from '../components/AuthLayout';
import { CodeInput } from '../components/CodeInput';
import { createForgotPasswordSchema, createResetPasswordSchema } from '../schemas';
import { setSignInHandoff } from '../sign-in-handoff';

import styles from './ResetPasswordPage.module.scss';

type Step = 'request' | 'reset';

type Issue = { path: ReadonlyArray<PropertyKey>; message: string };

/** First message per field, keyed by the top-level field name. */
function issuesToFields(issues: ReadonlyArray<Issue>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '');
    out[key] ??= issue.message;
  }
  return out;
}

/**
 * Password recovery, in two steps on one route.
 *
 * Step one asks for the address and requests a code. Step two takes the code
 * and the new password together, because the API accepts them in one call.
 *
 * Step one moves on whatever the address. Whether an account exists for it is
 * the server's to decide, and a screen that behaves differently for unknown
 * addresses tells anyone who asks which addresses have accounts.
 */
export function ResetPasswordPage() {
  const { m } = useI18n();
  const navigate = useNavigate();
  const errorId = useId();
  const codeErrorId = useId();
  const forgotSchema = useMemo(() => createForgotPasswordSchema(m), [m]);
  const resetSchema = useMemo(() => createResetPasswordSchema(m), [m]);

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFailure(caught: unknown) {
    if (caught instanceof NetworkError) {
      setFormError(m.auth.networkError);
      return;
    }
    if (caught instanceof ApiError) {
      const fields = caught.fieldErrors();
      if (Object.keys(fields).length > 0) {
        setFieldErrors(fields);
        return;
      }
      setFormError(caught.message || m.auth.genericError);
      return;
    }
    setFormError(m.auth.genericError);
  }

  async function requestCode() {
    setFormError(null);
    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(issuesToFields(parsed.error.issues));
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await forgotPassword({ email: parsed.data.email });
      setEmail(parsed.data.email);
      setStep('reset');
    } catch (caught) {
      handleFailure(caught);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReset() {
    setFormError(null);
    const parsed = resetSchema.safeParse({ code, password });
    if (!parsed.success) {
      setFieldErrors(issuesToFields(parsed.error.issues));
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await resetPassword({ email, code: parsed.data.code, password: parsed.data.password });
      setSignInHandoff({ email, notice: 'passwordReset' });
      await navigate({ to: '/sign-in' });
    } catch (caught) {
      handleFailure(caught);
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <>
      {m.auth.rememberedIt} <Link to="/sign-in">{m.auth.signInLink}</Link>
    </>
  );

  const errorBanner = formError ? (
    <p id={errorId} className={styles.error} role="alert">
      <TriangleAlert className={styles.errorIcon} aria-hidden="true" />
      <span>{formError}</span>
    </p>
  ) : null;

  if (step === 'request') {
    return (
      <AuthLayout title={m.auth.forgotTitle} subtitle={m.auth.forgotSubtitle} footer={footer}>
        <form
          className={styles.form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void requestCode();
          }}
        >
          {errorBanner}
          <Field
            label={m.auth.emailLabel}
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder={m.auth.emailPlaceholder}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors({});
            }}
            error={fieldErrors.email}
          />
          <Button type="submit" loading={submitting}>
            {submitting ? m.auth.submitting : m.auth.forgotSubmit}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={m.auth.resetTitle} footer={footer}>
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submitReset();
        }}
      >
        <div className={styles.sentBlock}>
          <p className={styles.sentTo}>{m.verify.sentToLead}</p>
          <p className={styles.address}>{email}</p>
        </div>

        {errorBanner}

        {/* Lets a password manager save the new password against the right
            account. Hidden rather than absent: managers read it, people do not
            need to see it. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

        <div>
          <CodeInput
            label={m.verify.codeLabel}
            value={code}
            onChange={(next) => {
              setCode(next);
              setFieldErrors({});
            }}
            error={fieldErrors.code}
            describedBy={fieldErrors.code ? codeErrorId : undefined}
            disabled={submitting}
            autoFocus
          />
          {/* The code boxes render no message of their own. */}
          {fieldErrors.code ? (
            <p id={codeErrorId} className={styles.fieldError} role="alert">
              {fieldErrors.code}
            </p>
          ) : null}
        </div>

        <Field
          label={m.auth.newPasswordLabel}
          type="password"
          name="password"
          autoComplete="new-password"
          revealable
          spellCheck={false}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors({});
          }}
          error={fieldErrors.password}
          hint={m.auth.passwordHint}
        />

        <Button type="submit" loading={submitting}>
          {submitting ? m.auth.submitting : m.auth.resetSubmit}
        </Button>

        <button
          type="button"
          className={styles.linkButton}
          onClick={() => {
            setStep('request');
            setCode('');
            setPassword('');
            setFieldErrors({});
            setFormError(null);
          }}
        >
          {m.auth.useDifferentEmail}
        </button>
      </form>
    </AuthLayout>
  );
}
