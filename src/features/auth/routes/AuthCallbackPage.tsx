import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { completeGoogleSignIn, type GoogleFailure, GoogleSignInError } from '@/lib/auth/google';

import { AuthLayout } from '../components/AuthLayout';

/**
 * The OAuth redirect target.
 *
 * Cognito sends the browser back here with `?code=...&state=...`. This
 * exchanges that code for tokens and then gets out of the way. Both flows
 * converge at this point: from here on the app holds an id token and cannot
 * tell how it was obtained.
 */
export function AuthCallbackPage() {
  const { m } = useI18n();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // The exchange is single-use: the verifier is deleted when read, so a second
  // run would fail. StrictMode double-invokes effects in development, which is
  // exactly the case this guards.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    completeGoogleSignIn(window.location.search)
      .then(async () => {
        // Replace rather than push: the callback URL carries a spent code and
        // must not be reachable with the back button.
        await navigate({ to: '/app', replace: true });
      })
      .catch((caught: unknown) => {
        // Translated here from a reason code, so the screen never shows an
        // English string built in the auth layer, nor text from the URL.
        const messages: Record<GoogleFailure, string> = {
          cancelled: m.auth.googleCancelled,
          stale: m.auth.googleStale,
          mismatch: m.auth.googleMismatch,
          invalidCode: m.auth.googleExpiredCode,
          failed: m.auth.googleFailed,
        };
        setError(
          caught instanceof GoogleSignInError ? messages[caught.reason] : m.auth.googleFailed,
        );
      });
  }, [navigate, m]);

  if (error) {
    return (
      <AuthLayout
        title={m.auth.googleFailed}
        subtitle={error}
        footer={
          <>
            {m.auth.haveAccount} <Link to="/sign-in">{m.auth.signInLink}</Link>
          </>
        }
      >
        {/* Every one of these failures is fixed by starting again, so the
            screen offers that rather than leaving a dead end. */}
        <Button asChild>
          <Link to="/sign-in">{m.auth.googleTryAgain}</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={m.auth.completingSignIn}
      footer={
        <>
          {m.auth.haveAccount} <Link to="/sign-in">{m.auth.signInLink}</Link>
        </>
      }
    >
      {/* Announced so a screen reader is told the page is working rather than
          being left on a silent, apparently empty screen. */}
      <p role="status" aria-live="polite" className="sr-only">
        {m.auth.completingSignIn}
      </p>
    </AuthLayout>
  );
}
