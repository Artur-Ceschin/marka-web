import {
  type AnyRoute,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { PageLoader } from '@/components/ui/PageLoader';
import { AuthCallbackPage } from '@/features/auth/routes/AuthCallbackPage';
import { ResetPasswordPage } from '@/features/auth/routes/ResetPasswordPage';
import { SignInPage } from '@/features/auth/routes/SignInPage';
import { SignUpPage } from '@/features/auth/routes/SignUpPage';
import { VerifyEmailPage } from '@/features/auth/routes/VerifyEmailPage';
import { LandingPage } from '@/features/marketing/routes/LandingPage';
import { PlantsHomePage } from '@/features/plants/routes/PlantsHomePage';

import { redirectIfSignedIn, requireSession } from './route-guards';

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
  // Shown while a route's beforeLoad is still running, e.g. the session refresh
  // in the auth guards. The delay keeps fast refreshes invisible (no flash of a
  // loader for a 100ms wait), and the minimum keeps a slow one from blinking
  // on and straight back off when it resolves just after appearing.
  defaultPendingComponent: PageLoader,
  defaultPendingMs: 250,
  defaultPendingMinMs: 500,
});

// Gives `<Link to="...">` autocomplete and compile-time checking of every path.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
