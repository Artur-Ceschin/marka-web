# Deployment

The web app is a static bundle hosted on **AWS Amplify Hosting**. DNS stays on
**Cloudflare**; Route 53 is not used.

Build settings live in [`amplify.yml`](../amplify.yml) and response headers in
[`customHttp.yml`](../customHttp.yml), so both are reviewed like code. Only the
items below are set in the console.

## One-time setup

### 1. Connect the repository

Amplify Hosting → New app → Host web app → GitHub → this repo, branch `main`.
Amplify picks up `amplify.yml`; nothing needs editing in the console editor.

### 2. Environment variables

App settings → Environment variables. Set all four: the committed `.env` holds
development defaults, and a build that fell back to them would ship an app
pointing at localhost. An Amplify build refuses to run if any of these is
missing or still points at localhost, so that mistake fails the deploy rather
than shipping.

These are build-time values, inlined into the bundle and readable by anyone
who opens the site, so none of them may ever be a secret. That is fine for
what is here: a Cognito app client id is a public identifier, and a PKCE flow
has no client secret.

| Variable                  | Value                                             |
| ------------------------- | ------------------------------------------------- |
| `VITE_API_URL`            | `https://api.markaplant.app`                      |
| `VITE_COGNITO_DOMAIN`     | `marka-auth-dev.auth.us-east-1.amazoncognito.com` |
| `VITE_COGNITO_CLIENT_ID`  | the app client id                                 |
| `VITE_OAUTH_REDIRECT_URI` | `https://markaplant.app/auth/callback`            |

`VITE_OAUTH_REDIRECT_URI` must match a callback registered on the Cognito app
client **exactly**, string for string.

### 3. Single-page app rewrite

App settings → Rewrites and redirects. Without this, a reload on `/journal`,
`/profile` or `/auth/callback` returns 404, because only `/index.html` exists.

| Source | Target        | Type          |
| ------ | ------------- | ------------- |
| `/<*>` | `/index.html` | 200 (Rewrite) |

Amplify offers this as the "Single page app" preset. It must not shadow real
files: the preset already excludes requests with a file extension.

### 4. Custom domain with Cloudflare DNS

1. Amplify → Domain management → Add domain → `markaplant.app`.
2. Amplify shows two kinds of record: one ACM validation `CNAME`, and the
   domain records pointing at the Amplify CloudFront target.
3. Add them in Cloudflare with the proxy **off** (grey cloud, "DNS only").
   A proxied record breaks ACM validation, and once live it would put
   Cloudflare's CDN in front of Amplify's for no benefit.
4. The apex works because Cloudflare flattens `CNAME` at the root.
5. Validation usually takes minutes, but ACM can take up to an hour.

### 5. API side

- **CORS:** the API must allow `https://markaplant.app` with credentials, in
  addition to `http://localhost:3000`.
- **Cognito:** add `https://markaplant.app/auth/callback` to the app client's
  callback URLs and `https://markaplant.app` to its sign-out URLs.

## Things that will bite

**The refresh cookie depends on the app and the API sharing a site.**
`markaplant.app` and `api.markaplant.app` are the same site, so the `httpOnly`
refresh cookie is sent on API calls while it stays `Secure`. If the frontend
ever moves to a different domain (an `amplifyapp.com` URL included), that
cookie must become `SameSite=None` or sign-in silently stops working after the
first hour.

**Branch previews cannot do Google sign-in.** Every preview gets its own
`https://<branch>.<id>.amplifyapp.com` origin, and Cognito only accepts
callback URLs registered in advance. Email and password sign-in works there;
Google does not, unless that exact URL is registered. Do not register a
wildcard.

**`index.html` must stay uncached.** `customHttp.yml` sets `no-cache` on it and
a year on `/assets/**`. Hashed asset names make that safe. Reversing the two
leaves people on an old build after every deploy.

**The build runs the test suite.** `pnpm verify` runs lint, typecheck and tests
before `pnpm build`, so a failing test fails the deploy rather than shipping.

## Rolling back

Amplify keeps every deployment. Hosting → the branch → Deployments → pick the
last good build → Redeploy this version. Faster than reverting a commit, and
the revert can follow at a normal pace.

## Checking a release

After a deploy, confirm:

1. A hard reload on `https://markaplant.app/journal` renders the journal
   rather than a 404 (the rewrite works).
2. Signing in, then reloading, keeps you signed in (the cookie crosses to the
   API).
3. DevTools → Network → `index.html` shows `Cache-Control: no-cache`, and a
   file under `/assets/` shows `immutable`.
4. DevTools → Console shows no Content-Security-Policy violations.
