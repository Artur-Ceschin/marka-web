import { useI18n } from '@/app/providers/i18n';
import { LOCALE_LABELS, LOCALES } from '@/lib/i18n';

import styles from './LanguageToggle.module.scss';

/**
 * Language switcher.
 *
 * A `<fieldset>` with a visually hidden `<legend>` rather than a div with
 * `role="group"`: the element carries the grouping semantics natively, so
 * there is no ARIA to keep in sync.
 *
 * The options are toggle buttons with `aria-pressed`, not radios, because they
 * act immediately rather than staging a choice for submission.
 *
 * Each option is labelled in its OWN language ("Português", not "Portuguese"),
 * which is the one thing someone who cannot read the current language will
 * still recognise. `lang` on each option makes a screen reader pronounce it
 * correctly instead of reading Portuguese with an English voice.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, m } = useI18n();

  return (
    <fieldset className={[styles.group, className].filter(Boolean).join(' ')}>
      <legend className="sr-only">{m.a11y.languageGroup}</legend>
      {LOCALES.map((option) => {
        const selected = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={selected}
            aria-label={LOCALE_LABELS[option].full}
            className={[styles.option, selected ? styles.selected : ''].filter(Boolean).join(' ')}
            onClick={() => {
              setLocale(option);
            }}
          >
            {LOCALE_LABELS[option].short}
          </button>
        );
      })}
    </fieldset>
  );
}
