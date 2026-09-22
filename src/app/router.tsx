import {
  type AnyRoute,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
} from '@tanstack/react-router';
import { PageLoader } from '@/components/ui/PageLoader';
import { LandingPage } from '@/features/marketing/routes/LandingPage';

import { redirectIfSignedIn, requireSession } from './route-guards';

// Everything but the landing page is loaded on demand. A first visit to "/"
// no longer downloads the catalogue, the auth forms, TanStack Form or the
// identify flow. `defaultPreload: 'intent'` below fetches a route's chunk when
// a link to it is hovered or focused, so the split costs no wait on click.
const PlantsHomePage = lazyRouteComponent(
  () => import('@/features/plants/routes/PlantsHomePage'),
  'PlantsHomePage',
);
const PlantJournalPage = lazyRouteComponent(
  () => import('@/features/plants/routes/PlantJournalPage'),
  'PlantJournalPage',
);
const ProfilePage = lazyRouteComponent(
  () => import('@/features/profile/routes/ProfilePage'),
  'ProfilePage',
);
const SignInPage = lazyRouteComponent(
  () => import('@/features/auth/routes/SignInPage'),
  'SignInPage',
);
const SignUpPage = lazyRouteComponent(
  () => import('@/features/auth/routes/SignUpPage'),
  'SignUpPage',
);
const AuthCallbackPage = lazyRouteComponent(
  () => import('@/features/auth/routes/AuthCallbackPage'),
  'AuthCallbackPage',
);
const VerifyEmailPage = lazyRouteComponent(
  () => import('@/features/auth/routes/VerifyEmailPage'),
  'VerifyEmailPage',
);
const ResetPasswordPage = lazyRouteComponent(
  () => import('@/features/auth/routes/ResetPasswordPage'),
  'ResetPasswordPage',
);

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

const journalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/journal',
  beforeLoad: requireSession,
  component: PlantJournalPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: requireSession,
  component: ProfilePage,
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
  journalRoute,
  profileRoute,
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
