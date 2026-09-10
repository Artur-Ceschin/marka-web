import 'vitest';

/**
 * Registers the `jest-axe` matcher with Vitest's types.
 *
 * `expect.extend(toHaveNoViolations)` in setup.ts adds the matcher at runtime,
 * but TypeScript has no way to know that: this augmentation is what makes
 * `expect(results).toHaveNoViolations()` typecheck.
 */
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
