import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { IdleSignOut } from '@/app/IdleSignOut';
import { I18nProvider } from '@/app/providers/I18nProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { router } from '@/app/router';
import { setSignInHandoff } from '@/features/auth/sign-in-handoff';
import { setOnSessionEnded } from '@/lib/auth/session';
import { useIsAuthenticated } from '@/lib/auth/use-auth';
import { createQueryClient } from '@/lib/query-client';

/** Runs the idle timer only while someone is signed in. */
function IdleGuard({ queryClient }: { queryClient: QueryClient }) {
  const signedIn = useIsAuthenticated();
  if (!signedIn) return null;
  return (
    <IdleSignOut
      onSignedOut={() => {
        queryClient.clear();
        setSignInHandoff({ email: '', notice: 'idle' });
        void router.navigate({ to: '/sign-in', replace: true });
      }}
    />
  );
}

export function App() {
  // One place decides what an unrecoverable session does. Registered here
  // rather than inside the http layer so that layer stays free of routing.
  useEffect(() => {
    setOnSessionEnded(() => {
      void router.navigate({ to: '/sign-in', replace: true });
    });
    return () => {
      setOnSessionEnded(null);
    };
  }, []);

  const [queryClient] = useState(createQueryClient);

  return (
    <I18nProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <IdleGuard queryClient={queryClient} />
        </QueryClientProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
