import { GoogleIcon } from '@/components/ui/icons/GoogleIcon';

import styles from './OAuthButtons.module.scss';

interface GoogleButtonProps {
  /** "Continue" reads correctly on both sign-in and sign-up. */
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function OAuthDivider({ label = 'or' }: { label?: string }) {
  // A decorative rule, so it must not be announced. The visible word is the
  // only part with meaning and it is carried by the surrounding buttons.
  return (
    <div className={styles.divider} aria-hidden="true">
      {label}
    </div>
  );
}

export function GoogleButton({
  label = 'Continue with Google',
  onClick,
  disabled,
}: GoogleButtonProps) {
  return (
    <button type="button" className={styles.google} onClick={onClick} disabled={disabled}>
      <GoogleIcon className={styles.googleIcon} />
      {label}
    </button>
  );
}
