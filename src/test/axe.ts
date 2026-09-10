import { configureAxe } from 'jest-axe';

/**
 * Shared axe runner.
 *
 * Two rules are off because they are page-level concerns that cannot hold for
 * an isolated component rendered into a bare container: leaving them on would
 * mean every component test reports the same two false positives:
 *   - `region`: content must sit inside a landmark. True of the page, not of a
 *     Button rendered on its own.
 *   - `page-has-heading-one`: likewise a whole-document rule.
 */
export const axe = configureAxe({
  rules: {
    region: { enabled: false },
    'page-has-heading-one': { enabled: false },
  },
});
