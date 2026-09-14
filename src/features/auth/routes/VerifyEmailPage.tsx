import { Link, useNavigate } from '@tanstack/react-router';
import { TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { ApiError, NetworkError } from '@/lib/api-error';
import { confirmSignUp, resendCode, signIn } from '../api/auth-api';
import { AuthLayout } from '../components/AuthLayout';
import { CODE_LENGTH, CodeInput } from '../components/CodeInput';
import { takePendingCredentials } from '../pending-credentials';
import { clearPendingEmail, getPendingEmail } from '../pending-verification';
import { createVerificationSchema } from '../schemas';
import { setSignInHandoff } from '../sign-in-handoff';

import styles from './VerifyEmailPage.module.scss';

/** Long enough to discourage hammering, short enough not to strand anyone. */
const RESEND_COOLDOWN_SECONDS = 45;

export function VerifyEmailPage() {
  const { m } = useI18n();
  const navigate = useNavigate();
  const schema = useMemo(() => createVerificationSchema(m), [m]);
  const errorId = useId();

  // Read once on mount: the address sign-up just sent a code to.
  const [email] = useState(getPendingEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((seconds) => seconds - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [cooldown]);

  const submit = useCallback(
    async (value: string) => {
      const parsed = schema.safeParse({ code: value });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? m.validation.codeInvalid);
        return;
      }

      setError(null);
      setSubmitting(true);
      try {
        await confirmSignUp({ email: email ?? '', code: value });
        clearPendingEmail();

        // Confirming does not sign anyone in. When the password from sign-up is
        // still in memory, sign in now and go straight to the app.
        const credentials = takePendingCredentials(email ?? '');
        if (credentials) {
          try {
            await signIn(credentials);
            await navigate({ to: '/app' });
            return;
          } catch {
            // The account IS verified; only the automatic sign-in failed.
            // Fall through and let them sign in themselves.
          }
        }

        // No password in memory (the page was reloaded after sign-up, which is
        // common on mobile) or the automatic sign-in failed: sign-in with the
        // address prefilled and a note saying why they are there.
        setSignInHandoff({ email: email ?? '', notice: 'verified' });
        await navigate({ to: '/sign-in' });
      } catch (caught) {
        if (caught instanceof NetworkError) {
          setError(m.auth.networkError);
        } else if (caught instanceof ApiError) {
          // The server's own message wins where it has one: it knows whether
          // the code was wrong or simply stale.
          const detail = caught.details[0]?.message;
          setError(detail ?? caught.message ?? m.verify.codeIncorrect);
        } else {
          setError(m.verify.codeIncorrect);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [schema, m, navigate, email],
  );

  // No pending sign-up on this device. Without this the page is a dead end, so
  // say what happened and offer the way out.
  if (!email) {
    return (
      <AuthLayout
        title={m.verify.noPendingTitle}
        subtitle={m.verify.noPendingSubtitle}
        footer={
          <>
            {m.auth.haveAccount} <Link to="/sign-in">{m.auth.signInLink}</Link>
          </>
        }
      >
        <Button asChild>
          <Link to="/sign-up">{m.auth.signUpSubmit}</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={m.verify.title}
      footer={
        <>
          {m.verify.wrongAddress} <Link to="/sign-up">{m.verify.startOver}</Link>
        </>
      }
    >
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit(code);
        }}
      >
        {/* The lead-in lives here rather than in the layout's subtitle slot,
            so it sits tight against the address instead of reading as a
            separate statement a paragraph away. The address gets its own line
            because it is the thing to check at a glance, and a long one then
            wraps without dragging the layout with it. */}
        <div className={styles.sentBlock}>
          <p className={styles.sentTo}>{m.verify.sentToLead}</p>
          <p className={styles.address}>{email}</p>
          <p className={styles.expiry}>{m.verify.expiry}</p>
        </div>

        {error ? (
          <p id={errorId} className={styles.error} role="alert">
            <TriangleAlert className={styles.errorIcon} aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : null}

        <CodeInput
          label={m.verify.codeLabel}
          value={code}
          onChange={(next) => {
            setCode(next);
            if (error) setError(null);
          }}
          // Submitting on the last digit saves a deliberate tap, and matches
          // what OS code-autofill sets up. The button stays for anyone who
          // prefers it or whose autofill lands oddly.
          onComplete={(value) => {
            void submit(value);
          }}
          error={error ?? undefined}
          describedBy={error ? errorId : undefined}
          disabled={submitting}
          autoFocus
        />

        <div className={styles.actions}>
          <Button type="submit" loading={submitting} disabled={code.length < CODE_LENGTH}>
            {submitting ? m.verify.submitting : m.verify.submit}
          </Button>

          {/* Announces the resend confirmation without stealing focus. */}
          <p className={styles.status} aria-live="polite">
            {status}
          </p>

          <div className={styles.secondaryRow}>
            <button
              type="button"
              className={styles.linkButton}
              disabled={cooldown > 0}
              onClick={() => {
                // Cooldown starts immediately, so a slow response cannot be
                // turned into repeat presses.
                setCooldown(RESEND_COOLDOWN_SECONDS);
                setStatus(null);
                void resendCode({ email })
                  .then(() => {
                    setStatus(m.verify.resent);
                  })
                  .catch(() => {
                    setError(m.auth.networkError);
                  });
              }}
            >
              {cooldown > 0 ? m.verify.resendIn(cooldown) : m.verify.resend}
            </button>
          </div>

          <p className={styles.spamHint}>{m.verify.spamHint}</p>
        </div>
      </form>
    </AuthLayout>
  );
}
