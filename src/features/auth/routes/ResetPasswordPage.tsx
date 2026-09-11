import { Link } from '@tanstack/react-router';

import { AuthLayout } from '../components/AuthLayout';

/**
 * Placeholder.
 *
 * The sign-in form links here because a password form without a recovery route
 * is a dead end, and a link that 404s is worse than an honest holding page.
 * Replace the body with the real Cognito `forgotPassword` flow.
 */
export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Password reset is not ready yet"
      subtitle="Marka is still being built and account recovery is not wired up. If you are locked out, the account has not been created yet either."
      footer={
        <>
          Go back to <Link to="/sign-in">sign in</Link>
        </>
      }
    >
      <p />
    </AuthLayout>
  );
}
