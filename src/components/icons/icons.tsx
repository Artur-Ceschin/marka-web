import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function SvgBase({
  size = 18,
  strokeWidth = 1.75,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <SvgBase size={16} strokeWidth={2} {...props}>
      <path d="m9 18 6-6-6-6" />
    </SvgBase>
  );
}

export function BackArrowIcon(props: IconProps) {
  return (
    <SvgBase size={20} strokeWidth={2} {...props}>
      <path d="M19 12H5" />
      <path d="m12 5-7 7 7 7" />
    </SvgBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <SvgBase size={22} strokeWidth={2} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgBase>
  );
}

export function LeafOutlineIcon(props: IconProps) {
  return (
    <SvgBase size={40} strokeWidth={1.5} {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </SvgBase>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </SvgBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </SvgBase>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </SvgBase>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <SvgBase size={14} strokeWidth={2} {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </SvgBase>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </SvgBase>
  );
}
