import { Label } from '@radix-ui/react-label';
import { Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { type InputHTMLAttributes, type ReactNode, useId, useState } from 'react';
import { useI18n } from '@/app/providers/i18n';

import styles from './Field.module.scss';

export interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  label: string;
  /** Validation message. Its presence is what marks the field invalid. */
  error?: string | undefined;
  /** Persistent helper text, shown only while there is no error. */
  hint?: ReactNode;
  /** Adds a show/hide toggle. Only meaningful for `type="password"`. */
  revealable?: boolean;
  /** Sits opposite the label. Use for 'Optional', or a 'Forgot?' link. */
  labelAside?: ReactNode;
}

/**
 * Label + input + message, wired together by id.
 *
 * The three ids are generated rather than passed in because the wiring is the
 * whole point of the component: `aria-describedby` must name the message
 * element, and `aria-invalid` must agree with whether an error is showing. Left
 * to call sites, those drift apart silently and only a screen reader notices.
 */
export function Field({
  label,
  error,
  hint,
  revealable = false,
  labelAside,
  type = 'text',
  required,
  ...props
}: FieldProps) {
  const { m } = useI18n();
  const id = useId();
  const messageId = `${id}-message`;
  const [revealed, setRevealed] = useState(false);

  const invalid = Boolean(error);
  const inputType = revealable && revealed ? 'text' : type;
  const showMessage = Boolean(error ?? hint);

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        {/* Radix Label forwards htmlFor and, unlike a bare <label>, will not
            steal a click that lands on selectable text inside it. */}
        <Label htmlFor={id} className={styles.label}>
          {label}
        </Label>
        {labelAside ? <span className={styles.optional}>{labelAside}</span> : null}
      </div>

      <div className={styles.control}>
        <input
          {...props}
          id={id}
          type={inputType}
          required={required}
          aria-invalid={invalid || undefined}
          // Only point at the message when one is rendered; a dangling
          // aria-describedby is announced as an empty description.
          aria-describedby={showMessage ? messageId : undefined}
          className={[
            styles.input,
            revealable ? styles.inputWithAffix : '',
            invalid ? styles.invalid : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {revealable ? (
          <button
            type="button"
            className={styles.affix}
            onClick={() => {
              setRevealed((v) => !v);
            }}
            // The control is icon-only, so it needs its own name, and the name
            // states the action rather than the current state.
            aria-label={revealed ? m.a11y.hidePassword : m.a11y.showPassword}
            aria-pressed={revealed}
          >
            {revealed ? (
              <EyeOff className={styles.affixIcon} aria-hidden="true" />
            ) : (
              <Eye className={styles.affixIcon} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      {/* Always in the DOM so assistive tech has something to watch, and so the
          reserved height stops the form jumping when a message appears. */}
      <p
        id={messageId}
        className={[styles.message, invalid ? styles.error : styles.hint].join(' ')}
        aria-live="polite"
      >
        {error ? (
          <>
            <TriangleAlert className={styles.messageIcon} aria-hidden="true" />
            <span>{error}</span>
          </>
        ) : (
          hint
        )}
      </p>
    </div>
  );
}
