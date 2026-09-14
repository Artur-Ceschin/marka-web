import { useI18n } from '@/app/providers/i18n';
import { GoogleIcon } from '@/components/ui/icons/GoogleIcon';

import styles from './OAuthButtons.module.scss';

interface GoogleButtonProps {
  /** "Continue" reads correctly on both sign-in and sign-up. */
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function OAuthDivider() {
  const { m } = useI18n();
  // A decorative rule, so it must not be announced. The visible word is the
  // only part with meaning and it is carried by the surrounding buttons.
  return (
    <div className={styles.divider} aria-hidden="true">
      {m.common.or}
    </div>
  );
}

export function GoogleButton({ label, onClick, disabled }: GoogleButtonProps) {
  const { m } = useI18n();

  return (
    <button type="button" className={styles.google} onClick={onClick} disabled={disabled}>
      <GoogleIcon className={styles.googleIcon} />
      {label ?? m.auth.continueWithGoogle}
    </button>
  );
}
