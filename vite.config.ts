import { createHash } from 'node:crypto';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { loadEnv, type Plugin } from 'vite';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vitest/config';

/**
 * Adds a Content-Security-Policy to the built index.html.
 *
 * Injected script is the attack that matters most: it can no longer read the
 * refresh token, but it could still act as the signed-in user from inside the
 * page. This policy only lets scripts run from our own origin
 * plus the one inline theme script, pinned by its hash: edit that script and
 * the hash follows automatically on the next build.
 *
 * Build only: the dev server injects inline scripts and styles of its own.
 * Headers a <meta> cannot carry (frame-ancestors, HSTS) belong on the host.
 */
function contentSecurityPolicy(): Plugin {
  let env: Record<string, string> = {};
  const origin = (value: string | undefined) => {
    if (!value) return '';
    try {
      return new URL(value.includes('://') ? value : `https://${value}`).origin;
    } catch {
      return '';
    }
  };

  return {
    name: 'marka-content-security-policy',
    apply: 'build',
    configResolved(config) {
      env = loadEnv(config.mode, config.envDir || process.cwd(), 'VITE_');
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const inlineScripts = [
          ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
        ];
        const hashes = inlineScripts.map(
          ([, body = '']) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`,
        );
        const connect = [
          "'self'",
          // Cognito is not listed: the Google code exchange now goes through
          // the API, and the authorize redirect is a navigation, not a fetch.
          origin(env.VITE_API_URL),
          // Presigned photo uploads go straight to S3.
          'https://*.amazonaws.com',
        ].filter(Boolean);

        const policy = [
          "default-src 'self'",
          `script-src 'self' ${hashes.join(' ')}`,
          "style-src 'self'",
          // Signed catalogue photos and reference photos come from other hosts;
          // blob: is the preview of a photo that was just picked.
          "img-src 'self' data: blob: https:",
          "font-src 'self'",
          `connect-src ${connect.join(' ')}`,
          "manifest-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ');

        return html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
        );
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    contentSecurityPolicy(),
    // Generates responsive, modern-format variants from the originals in
    // src/assets at build time. The source images are 3–7 MP camera JPEGs;
    // shipping them as-is would be ~19 MB of payload.
    // Per-image widths and quality live in src/assets/images.ts. Note that a
    // `defaultDirectives` here REPLACES the directives in the import URL rather
    // than merging with them, which silently drops the width sets: hence the
    // plugin takes no options and every directive is stated at the import.
    imagetools(),
  ],
  server: {
    // Matches the redirect URI registered on the Cognito app client
    // (http://localhost:3000/auth/callback). Cognito compares that string
    // exactly, so the dev server has to live on this port. `strictPort` makes a
    // conflict fail loudly instead of Vite silently moving to 3001, where the
    // Google flow would break with an unhelpful redirect_mismatch error.
    port: 3000,
    strictPort: true,
    // The API sets the refresh token as a SameSite=Strict cookie, and a browser
    // never sends that from localhost to api.markaplant.app: different sites.
    // Proxying keeps API calls same-origin in dev, so the cookie behaves as it
    // does in production. .env.development points VITE_API_URL here; set
    // API_PROXY_TARGET to aim at a local API instead.
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'https://api.markaplant.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // The cookie is scoped to Path=/auth, which behind the proxy is /api/auth.
        cookiePathRewrite: { '/auth': '/api/auth' },
      },
    },
  },
  resolve: {
    // Vite 8 reads `compilerOptions.paths` from tsconfig natively, so the
    // `@/*` alias has exactly one source of truth (tsconfig.app.json).
    tsconfigPaths: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Sass resolves its own imports and knows nothing about Vite's `@`
        // alias, so `@use "@/styles/tokens"` does not work here. `loadPaths`
        // puts src/ on Sass's search path instead, which is both resolvable
        // and faster than routing through an alias plugin.
        loadPaths: [fileURLToPath(new URL('./src', import.meta.url))],
        // Every .scss file gets tokens and mixins for free. Both emit no CSS of
        // their own: if they ever did, it would be duplicated into every
        // module's output.
        additionalData: `@use "styles/tokens" as *; @use "styles/mixins" as *;`,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts'],
    },
  },
});
