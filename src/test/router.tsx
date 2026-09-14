import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { I18nProvider } from '@/app/providers/I18nProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { LOCALE_STORAGE_KEY, type Locale } from '@/lib/i18n';

export async function renderWithRouter(
  ui: ReactNode,
  { path = '/', locale }: { path?: string; locale?: Locale } = {},
) {
  if (locale) {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage unavailable here; the default locale applies.
    }
  }

  // A fresh client per render: a shared one would carry cached responses from
  // one test into the next. Retries off, because the session layer already
  // retries once and a second layer only slows failing tests down.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const withProviders = (
    <I18nProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ThemeProvider>
    </I18nProvider>
  );

  const rootRoute = createRootRoute();

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => withProviders,
  });

  const stubRoutes = [
    '/sign-in',
    '/sign-up',
    '/reset-password',
    '/verify-email',
    '/auth/callback',
    '/app',
  ].map((stubPath) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: stubPath,
      component: () => withProviders,
    }),
  );

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, ...stubRoutes]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();

  return render(<RouterProvider router={router as never} />);
}
