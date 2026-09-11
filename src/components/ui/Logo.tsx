import type { SVGProps } from 'react';
import { useId } from 'react';

import styles from './Logo.module.scss';

/**
 * The Marka mark: a leaf and a lupine fused into one blade.
 *
 * The left edge is a smooth leaf margin. The right edge is cut into four
 * florets, the stacked pea-flowers of a lupine spike. One silhouette, two
 * readings, and the asymmetry is what makes it a mark rather than a generic
 * leaf.
 *
 * The midrib is a real cutout via a mask, not a stroke painted in the
 * background colour. A painted stroke only looks right on the one background it
 * was matched to; a mask makes the gap genuinely transparent, so the mark works
 * on a photograph and in both themes.
 *
 * `useId` because a mask needs a document-unique id and the logo renders more
 * than once per page. Verified legible down to 16px.
 */
const BLADE =
  'M12 2.6 Q15.4 5.2 15.6 6.8 Q13.6 7.2 13.4 7.8 Q16.8 9.0 17.1 10.4 ' +
  'Q13.9 10.9 13.7 11.5 Q17.0 12.6 17.0 14.0 Q13.7 14.4 13.5 15.0 ' +
  'Q15.6 16.0 15.4 17.1 Q13.4 17.4 12 17.8 Q6.6 15.9 6.6 11.4 Q6.6 7.0 12 2.6 Z';

/**
 * Decorative by default: everywhere it is used the word "Marka" is rendered
 * beside it, or the enclosing link carries the name.
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  const maskId = useId();

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" {...props}>
      <mask id={maskId}>
        {/* White keeps, black cuts. */}
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <path d="M12 4 L12 17.2" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
      </mask>
      <path d={BLADE} mask={`url(#${maskId})`} />
      <rect x="11.3" y="16.8" width="1.4" height="4.6" rx="0.7" />
    </svg>
  );
}

/** Mark plus wordmark. `translate="no"` keeps the brand out of auto-translation. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={[styles.lockup, className].filter(Boolean).join(' ')}>
      <LogoMark className={styles.mark} />
      <span className={styles.wordmark} translate="no">
        Marka
      </span>
    </span>
  );
}
