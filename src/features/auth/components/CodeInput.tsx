import { useEffect, useId, useRef, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';

import styles from './CodeInput.module.scss';

export const CODE_LENGTH = 6;

/** Stable keys for the six boxes. They never reorder, so position is identity. */
const SLOTS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired once the last digit arrives, including by paste or autofill. */
  onComplete?: (value: string) => void;
  label: string;
  error?: string | undefined;
  describedBy?: string | undefined;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Six-digit verification code entry.
 *
 * One real input under a row of decorative boxes. See the stylesheet for why
 * six separate inputs are the wrong shape.
 *
 * `autoComplete="one-time-code"` is the load-bearing attribute: it is what
 * makes iOS offer the code from Mail and Android autofill it. It only works on
 * a single input, which is the main reason for this structure.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  label,
  error,
  describedBy,
  disabled,
  autoFocus,
}: CodeInputProps) {
  const { m } = useI18n();
  const id = useId();
  const progressId = `${id}-progress`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;
    // Desktop only. On a phone this would throw the keyboard up over the
    // "we sent a code to..." line, hiding the context someone needs before
    // they switch to their mail app.
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (hasFinePointer) inputRef.current?.focus();
  }, [autoFocus]);

  const digits = value.split('');
  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

  function handleChange(next: string) {
    // Strip everything that is not a digit, so a pasted "123 456" or "code:
    // 123456" still works instead of being rejected.
    const cleaned = next.replace(/\D/g, '').slice(0, CODE_LENGTH);
    onChange(cleaned);
    if (cleaned.length === CODE_LENGTH) onComplete?.(cleaned);
  }

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      {/* No click handler: the transparent input is absolutely positioned over
          this whole wrapper, so a click anywhere here already lands on it. */}
      <div className={[styles.wrap, error ? styles.invalid : ''].filter(Boolean).join(' ')}>
        <input
          ref={inputRef}
          id={id}
          className={styles.input}
          value={value}
          onChange={(event) => {
            handleChange(event.target.value);
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
          type="text"
          inputMode="numeric"
          // Triggers the OS code-autofill affordance. Single input only.
          autoComplete="one-time-code"
          pattern="\d*"
          // Deliberately no maxLength. The browser applies it to the RAW value
          // before any handler runs, so pasting "123 456" would be truncated
          // to "123 45" and lose a digit. Length is enforced in handleChange
          // after non-digits are stripped, which is the only point where six
          // characters means six digits.
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[describedBy, progressId].filter(Boolean).join(' ') || undefined}
        />

        {SLOTS.map((slot, index) => {
          const digit = digits[index];
          const isActive = focused && index === activeIndex && value.length < CODE_LENGTH;
          return (
            <div
              key={slot}
              aria-hidden="true"
              className={[
                styles.box,
                digit ? styles.boxFilled : '',
                isActive ? styles.boxActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {digit ?? (isActive ? <span className={styles.caret} /> : null)}
            </div>
          );
        })}
      </div>

      {/* Digits are drawn in aria-hidden boxes, so without this a screen reader
          user gets no feedback that anything was typed. Polite, so it does not
          interrupt on every keystroke. */}
      <p id={progressId} className="sr-only" aria-live="polite">
        {m.a11y.codeProgress(value.length, CODE_LENGTH)}
      </p>
    </div>
  );
}
