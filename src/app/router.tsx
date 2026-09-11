import {
  type AnyRoute,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';

import { ResetPasswordPage } from '@/features/auth/routes/ResetPasswordPage';
import { SignInPage } from '@/features/auth/routes/SignInPage';
import { SignUpPage } from '@/features/auth/routes/SignUpPage';
import { LandingPage } from '@/features/marketing/routes/LandingPage';

/**
 * Code-based routing rather than TanStack Router's file-based convention.
 *
 * File-based routing wants every route under one `src/routes` directory, which
 * would cut across the feature-first architecture: a feature's pages would live
 * apart from its components and API layer. Defining the tree here keeps each
 * page inside its own feature and leaves this file as the only place that knows
 * how they fit together.
 */

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: SignInPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  component: SignUpPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  signUpRoute,
  resetPasswordRoute,
] as AnyRoute[]);

export const router = createRouter({
  routeTree,
  // The landing page anchors (#identify, #goal) must keep working, and the
  // browser cannot restore a hash position on a route it has not painted yet.
  scrollRestoration: true,
  defaultPreload: 'intent',
});

// Gives `<Link to="...">` autocomplete and compile-time checking of every path.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
