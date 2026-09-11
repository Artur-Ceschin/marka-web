import { Link, useNavigate } from '@tanstack/react-router';

import { AuthForm } from '../components/AuthForm';
import { AuthLayout } from '../components/AuthLayout';
import { signInSchema } from '../schemas';

export function SignInPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up your catalogue where you left it."
      footer={
        <>
          New here?{' '}
          <Link to="/sign-up" className="">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm
        schema={signInSchema}
        submitLabel="Sign in"
        passwordAutoComplete="current-password"
        showForgotLink
        onSubmit={async (values) => {
          // TODO: replace with the Cognito call once the API exists. Nothing
          // is transmitted today; the delay only exercises the pending state.
          await new Promise((resolve) => setTimeout(resolve, 600));
          // eslint-disable-next-line no-console
          console.info('sign-in submitted for', values.email);
          await navigate({ to: '/' });
        }}
        onGoogle={() => {
          // TODO: redirect to the Cognito Hosted UI Google identity provider.
          console.info('google sign-in requested');
        }}
      />
    </AuthLayout>
  );
}
