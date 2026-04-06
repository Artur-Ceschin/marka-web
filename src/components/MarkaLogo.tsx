// Ported 1-to-1 from marka-app/components/LeafMark.tsx
// Viewbox 96×96, uses the same geometry as the native SVG component.

interface LeafMarkProps {
  size?: number;
  className?: string;
}

export function LeafMark({ size = 96, className }: LeafMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Three concentric rings */}
      <circle cx="48" cy="48" r="44" fill="rgba(74,103,65,0.12)" />
      <circle cx="48" cy="48" r="38" fill="rgba(74,103,65,0.18)" />
      <circle cx="48" cy="48" r="32" fill="#4A6741" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(245,240,232,0.08)" strokeWidth="1" />

      {/* Leaf body — ellipse rotated -8° around its centre (48,43) */}
      <ellipse
        cx="48" cy="43"
        rx="14" ry="19"
        fill="rgba(245,240,232,0.92)"
        transform="rotate(-8 48 43)"
      />

      {/* Central vein (inside leaf) */}
      <line x1="48" y1="28" x2="48" y2="60"
        stroke="#4A6741" strokeWidth="1.5" strokeLinecap="round" />

      {/* Upper veins */}
      <line x1="48" y1="38" x2="40" y2="46"
        stroke="#4A6741" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="48" y1="38" x2="56" y2="46"
        stroke="#4A6741" strokeWidth="0.8" strokeLinecap="round" />

      {/* Lower veins */}
      <line x1="48" y1="46" x2="41" y2="53"
        stroke="#4A6741" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="48" y1="46" x2="55" y2="53"
        stroke="#4A6741" strokeWidth="0.6" strokeLinecap="round" />

      {/* Stem below leaf */}
      <line x1="48" y1="60" x2="48" y2="72"
        stroke="rgba(245,240,232,0.7)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
