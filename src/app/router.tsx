import {
  type AnyRoute,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import { AuthCallbackPage } from '@/features/auth/routes/AuthCallbackPage';
import { ResetPasswordPage } from '@/features/auth/routes/ResetPasswordPage';
import { SignInPage } from '@/features/auth/routes/SignInPage';
import { SignUpPage } from '@/features/auth/routes/SignUpPage';
import { VerifyEmailPage } from '@/features/auth/routes/VerifyEmailPage';
import { LandingPage } from '@/features/marketing/routes/LandingPage';
import { PlantsHomePage } from '@/features/plants/routes/PlantsHomePage';
import { hasSession } from '@/lib/auth/use-auth';

/**
 * Code-based routing rather than TanStack Router's file-based convention.
 *
 * File-based routing wants every route under one `src/routes` directory, which
 * would cut across the feature-first architecture: a feature's pages would live
 * apart from its components and API layer. Defining the tree here keeps each
 * page inside its own feature and leaves this file as the only place that knows
 * how they fit together.
 */

/** Signed-out visitors to the app go to sign-in. */
function requireSession() {
  if (!hasSession()) {
    throw redirect({ to: '/sign-in' });
  }
}

/**
 * Signed-in visitors to sign-in or sign-up go straight to the app.
 *
 * A stale refresh token bounces once and then settles: the app's first request
 * fails to refresh, the session layer clears the dead token, and the redirect
 * back to sign-in then sticks because there is no longer a session to find.
 */
function redirectIfSignedIn() {
  if (hasSession()) {
    throw redirect({ to: '/app' });
  }
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  beforeLoad: requireSession,
  component: PlantsHomePage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  beforeLoad: redirectIfSignedIn,
  component: SignInPage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  beforeLoad: redirectIfSignedIn,
  component: SignUpPage,
});

// Must match VITE_OAUTH_REDIRECT_URI and a callback registered on the Cognito
// app client, exactly: Cognito compares the string, not the resolved URL.
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallbackPage,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: VerifyEmailPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute,
  signInRoute,
  signUpRoute,
  resetPasswordRoute,
  verifyEmailRoute,
  authCallbackRoute,
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
