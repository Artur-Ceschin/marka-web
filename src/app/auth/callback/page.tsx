'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens, CognitoError } from '@/lib/cognito';
import { useAuthStore } from '@/store/auth.store';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const handled = useRef(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const error = searchParams.get('error');
    const code = searchParams.get('code');
    const isPopup = Boolean(window.opener && window.opener !== window);

    function fail(msg: string) {
      if (isPopup) {
        window.opener.postMessage({ type: 'AUTH_ERROR', error: msg }, window.location.origin);
        window.close();
      } else {
        setErrorMsg(`${msg} Redirecting…`);
        setTimeout(() => router.replace('/signin'), 2000);
      }
    }

    if (error) {
      fail(`Sign in failed (${error}).`);
      return;
    }
    if (!code) {
      fail('No authorisation code received.');
      return;
    }

    exchangeCodeForTokens(code)
      .then(({ userId, picture }) => {
        if (isPopup) {
          window.opener.postMessage(
            { type: 'AUTH_SUCCESS', userId, picture },
            window.location.origin,
          );
          window.close();
        } else {
          setAuthenticated(userId, null, picture);
          router.replace('/identify');
        }
      })
      .catch((err) => {
        const msg = err instanceof CognitoError ? err.message : 'Something went wrong.';
        fail(msg);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e231d',
        color: errorMsg ? '#ff7b7b' : 'rgba(250,248,244,0.55)',
        fontFamily: 'sans-serif',
        fontSize: 14,
      }}
    >
      {errorMsg || 'Signing you in…'}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1e231d',
            color: 'rgba(250,248,244,0.55)',
            fontFamily: 'sans-serif',
            fontSize: 14,
          }}
        >
          Signing you in…
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
