import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';

/**
 * `cva` maps variant props to class names. With SCSS Modules the values are
 * the imported module classes, not utility strings, so the mapping stays a
 * lookup table and all the actual styling lives in the stylesheet.
 */
const button = cva(styles.base, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      danger: styles.danger,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    VariantProps<typeof button> {
  /**
   * Render the child element instead of a `<button>`, keeping the styling.
   * Use for links that should look like buttons, a navigation control must be
   * an `<a>` so it is focusable, followable and openable in a new tab.
   */
  asChild?: boolean;
  /** Shows a spinner and marks the control busy. Also disables it. */
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Button({
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  type,
  className,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const classes = [button({ variant, size }), className].filter(Boolean).join(' ');

  return (
    <Comp
      // A <button> inside a <form> defaults to type="submit". Being explicit
      // avoids accidental submits; `asChild` renders an <a>, which takes none.
      {...(asChild ? {} : { type: type ?? 'button' })}
      className={classes}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {/* `Slottable` marks which child Slot should merge onto when `asChild`
          is set. Without it, the spinner makes two children and Slot throws
          "Expected a single React element child", so the loading state and
          asChild could not be combined. Siblings render inside the slotted
          element, which is where the spinner belongs anyway. */}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}
