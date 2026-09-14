import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { I18nProvider } from '@/app/providers/I18nProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { router } from '@/app/router';
import { setOnSessionEnded } from '@/lib/auth/session';
import { createQueryClient } from '@/lib/query-client';

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
        </QueryClientProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
