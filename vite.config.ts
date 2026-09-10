import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Generates responsive, modern-format variants from the originals in
    // src/assets at build time. The source images are 3–7 MP camera JPEGs;
    // shipping them as-is would be ~19 MB of payload.
    // Per-image widths and quality live in src/assets/images.ts. Note that a
    // `defaultDirectives` here REPLACES the directives in the import URL rather
    // than merging with them, which silently drops the width sets: hence the
    // plugin takes no options and every directive is stated at the import.
    imagetools(),
  ],
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
