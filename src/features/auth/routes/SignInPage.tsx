import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { ApiError } from '@/lib/api-error';

import { resendCode, signIn } from '../api/auth-api';
import { AuthForm } from '../components/AuthForm';
import { AuthLayout } from '../components/AuthLayout';
import { clearPendingEmail, setPendingEmail } from '../pending-verification';
import { createSignInSchema } from '../schemas';
import { clearSignInHandoff, peekSignInHandoff } from '../sign-in-handoff';

export function SignInPage() {
  const navigate = useNavigate();
  const { m } = useI18n();
  const schema = useMemo(() => createSignInSchema(m), [m]);

  // Peeked in the initializer and cleared in an effect, rather than consumed in
  // one go: StrictMode runs state initializers twice in development, and a read
  // that deletes would hand the second run nothing.
  const [handoff] = useState(peekSignInHandoff);
  useEffect(() => {
    clearSignInHandoff();
  }, []);

  const notices = { verified: m.auth.verifiedNotice, passwordReset: m.auth.resetDone };
  const notice = handoff ? notices[handoff.notice] : undefined;

  return (
    <AuthLayout
      title={m.auth.signInTitle}
      subtitle={m.auth.signInSubtitle}
      footer={
        <>
          {m.auth.newHere} <Link to="/sign-up">{m.auth.createAccount}</Link>
        </>
      }
    >
      <AuthForm
        schema={schema}
        submitLabel={m.auth.signInSubmit}
        passwordAutoComplete="current-password"
        showForgotLink
        defaultEmail={handoff?.email}
        notice={notice}
        onSubmit={async (values) => {
          try {
            await signIn(values);
          } catch (error) {
            // The credentials were right but the account was never verified.
            // That is a step to resume, not an error to display: send a fresh
            // code and route to the screen that consumes it.
            if (error instanceof ApiError && error.isUserNotConfirmed) {
              setPendingEmail(values.email);
              // Best effort. If the resend fails, the verification screen
              // still offers its own resend button.
              await resendCode({ email: values.email }).catch(() => undefined);
              await navigate({ to: '/verify-email' });
              return;
            }
            throw error;
          }

          clearPendingEmail();
          await navigate({ to: '/app' });
        }}
      />
    </AuthLayout>
  );
}
