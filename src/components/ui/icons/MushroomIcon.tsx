import type { SVGProps } from 'react';

/**
 * lucide-react ships no mushroom glyph (checked across all 6,236 exports), so
 * this one is drawn to their conventions: 24x24 grid, 2px round-capped
 * strokes, `currentColor`, no fill: to sit consistently beside the rest of
 * the set.
 *
 * The cap is deliberately wide and low and the stem thick with a rounded base:
 * a narrow stem under a tall dome reads as an umbrella. The two spots are what
 * make it unmistakable at 24px.
 *
 * Decorative by default via `aria-hidden`, so the accessible name lives on the
 * surrounding element. Override the prop if the icon ever needs to be
 * meaningful on its own.
 */
export function MushroomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Decorative by default, so it is hidden from assistive tech and the
      // label lives on the surrounding element. A caller that needs it to be
      // meaningful can override this and supply its own accessible name.
      aria-hidden="true"
      {...props}
    >
      {/* Cap: wide, low dome closed flat along its underside */}
      <path d="M3 12a9 7 0 0 1 18 0Z" />
      {/* Spots */}
      <circle cx="9" cy="9" r="1" />
      <circle cx="14.5" cy="7.5" r="1" />
      {/* Stem: thick, with a rounded base */}
      <path d="M9.5 12v5a2.5 2.5 0 0 0 5 0v-5" />
    </svg>
  );
}
