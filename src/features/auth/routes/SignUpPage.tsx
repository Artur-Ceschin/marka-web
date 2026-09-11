import { Link, useNavigate } from '@tanstack/react-router';

import { AuthForm } from '../components/AuthForm';
import { AuthLayout } from '../components/AuthLayout';
import { signUpSchema } from '../schemas';

export function SignUpPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Start your catalogue"
      subtitle="One account, every plant you record. Free while Marka is in the making."
      footer={
        <>
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </>
      }
    >
      <AuthForm
        schema={signUpSchema}
        submitLabel="Create account"
        passwordAutoComplete="new-password"
        passwordHint="At least 12 characters."
        onSubmit={async (values) => {
          // TODO: replace with the Cognito call once the API exists.
          await new Promise((resolve) => setTimeout(resolve, 600));
          console.info('sign-up submitted for', values.email);
          await navigate({ to: '/' });
        }}
        onGoogle={() => {
          // TODO: redirect to the Cognito Hosted UI Google identity provider.
          console.info('google sign-up requested');
        }}
      />
    </AuthLayout>
  );
}
