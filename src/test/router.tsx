import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

export async function renderWithRouter(ui: ReactNode, { path = '/' }: { path?: string } = {}) {
  const rootRoute = createRootRoute();

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{ui}</>,
  });

  const stubRoutes = ['/sign-in', '/sign-up', '/reset-password'].map((stubPath) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: stubPath,
      component: () => <>{ui}</>,
    }),
  );

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, ...stubRoutes]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();

  return render(<RouterProvider router={router as never} />);
}
