import { z } from 'zod';

/**
 * Runtime configuration, validated once at module load.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time, so a missing value is
 * baked into the bundle as `undefined` and surfaces much later as a fetch to
 * "undefined/auth/signin". Parsing here turns that into an immediate, readable
 * failure instead.
 */
const schema = z.object({
  VITE_API_URL: z.url('VITE_API_URL must be an absolute URL'),
  // Optional: only the Google flow needs these, and email/password sign-in
  // should keep working in a checkout that has not set them.
  VITE_COGNITO_DOMAIN: z.string().optional(),
  VITE_COGNITO_CLIENT_ID: z.string().optional(),
  VITE_OAUTH_REDIRECT_URI: z.string().optional(),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

export const config = {
  apiUrl: parsed.data.VITE_API_URL.replace(/\/$/, ''),
  cognito: {
    domain: parsed.data.VITE_COGNITO_DOMAIN ?? '',
    clientId: parsed.data.VITE_COGNITO_CLIENT_ID ?? '',
    redirectUri: parsed.data.VITE_OAUTH_REDIRECT_URI ?? '',
  },
} as const;

/**
 * Whether the hosted-UI flow can run. Checked before showing the Google button
 * rather than after someone presses it, so an unconfigured build never offers
 * a path that cannot work.
 */
export function isGoogleSignInConfigured(): boolean {
  const { domain, clientId, redirectUri } = config.cognito;
  return Boolean(domain && clientId && redirectUri);
}
