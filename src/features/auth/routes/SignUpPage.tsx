import { Link, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';

import { useI18n } from '@/app/providers/i18n';

import { signUp } from '../api/auth-api';
import { AuthForm } from '../components/AuthForm';
import { AuthLayout } from '../components/AuthLayout';
import { setPendingCredentials } from '../pending-credentials';
import { setPendingEmail } from '../pending-verification';
import { createSignUpSchema } from '../schemas';

export function SignUpPage() {
  const navigate = useNavigate();
  const { m } = useI18n();
  const schema = useMemo(() => createSignUpSchema(m), [m]);

  return (
    <AuthLayout
      title={m.auth.signUpTitle}
      subtitle={m.auth.signUpSubtitle}
      footer={
        <>
          {m.auth.haveAccount} <Link to="/sign-in">{m.auth.signInLink}</Link>
        </>
      }
    >
      <AuthForm
        schema={schema}
        submitLabel={m.auth.signUpSubmit}
        passwordAutoComplete="new-password"
        passwordHint={m.auth.passwordHint}
        onSubmit={async (values) => {
          await signUp(values);

          // Carried to the verification screen through sessionStorage rather
          // than a query string: an address is personal data and has no place
          // in history, logs or a pasted link.
          setPendingEmail(values.email);
          // In memory only, so verification can sign straight in afterwards.
          setPendingCredentials(values);
          await navigate({ to: '/verify-email' });
        }}
      />
    </AuthLayout>
  );
}
