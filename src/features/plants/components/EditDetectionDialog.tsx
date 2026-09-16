import { useForm } from '@tanstack/react-form';
import { LocateFixed, MapPin } from 'lucide-react';
import { useId, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { ApiError } from '@/lib/api-error';

import type { Detection, DetectionChanges, Location } from '../api/identify-api';
import { useUpdateDetection } from '../api/queries';
import { fromLocalInputValue, isInFuture, toLocalInputValue } from '../lib/datetime-local';
import { describePlantError } from '../lib/describe-plant-error';

import styles from './EditDetectionDialog.module.scss';

/** The API's limit on notes. */
export const NOTES_MAX = 2000;

const round2 = (value: number) => Math.round(value * 100) / 100;

function sameLocation(a: Location | null, b: Location | undefined): boolean {
  if (!a || !b) return !a && !b;
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

function firstError(errors: readonly unknown[]): string | undefined {
  return errors.find((error): error is string => typeof error === 'string');
}

interface EditDetectionDialogProps {
  detection: Detection;
  /** The display name, as the card shows it. */
  name: string;
  onClose: () => void;
}

/**
 * Notes, when the plant was seen, and where.
 *
 * Sends only what changed, as the API asks: an untouched field is left out,
 * and a field that was cleared is sent as null, which removes it.
 */
export function EditDetectionDialog({ detection, name, onClose }: EditDetectionDialogProps) {
  const { m, locale } = useI18n();
  const update = useUpdateDetection();
  const notesId = useId();

  const [location, setLocation] = useState<Location | null>(detection.location ?? null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [gone, setGone] = useState(false);

  const initialNotes = detection.notes ?? '';
  const initialObservedAt = toLocalInputValue(detection.observedAt);

  const form = useForm({
    defaultValues: { notes: initialNotes, observedAt: initialObservedAt },
    onSubmit: async ({ value }) => {
      const changes: DetectionChanges = {};
      const notes = value.notes.trim();
      // A blank note removes it; null says so explicitly.
      if (notes !== initialNotes.trim()) changes.notes = notes || null;
      if (value.observedAt !== initialObservedAt) {
        changes.observedAt = fromLocalInputValue(value.observedAt);
      }
      if (!sameLocation(location, detection.location)) changes.location = location;

      // Nothing to send is not an error, just a closed dialog.
      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }

      setFormError(null);
      setServerErrors({});
      try {
        await update.mutateAsync({ detectionId: detection.detectionId, changes });
        onClose();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setGone(true);
          return;
        }
        const fields = error instanceof ApiError ? error.fieldErrors() : {};
        // "location.latitude" and friends all belong under the location block.
        const byField: Record<string, string> = {};
        for (const [field, message] of Object.entries(fields)) {
          const key = field.split('.')[0] ?? field;
          if (key === 'notes' || key === 'observedAt' || key === 'location') {
            byField[key] ??= message;
          }
        }
        setServerErrors(byField);
        if (Object.keys(byField).length === 0) {
          setFormError(describePlantError(error, m, locale).title);
        }
      }
    },
  });

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setLocationError(m.plants.locationFailed);
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        // Rounded like the photo's own GPS: about a kilometre, enough for the
        // native-status note without storing someone's exact garden.
        setLocation({
          latitude: round2(position.coords.latitude),
          longitude: round2(position.coords.longitude),
        });
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? m.plants.locationDenied
            : m.plants.locationFailed,
        );
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  if (gone) {
    return (
      <Dialog open title={m.plants.editTitle} description={name} onClose={onClose}>
        <p className={styles.notice} role="alert">
          {m.plants.alreadyDeleted}
        </p>
        <div className={styles.footer}>
          <Button onClick={onClose}>{m.common.close}</Button>
        </div>
      </Dialog>
    );
  }

  const locationMessage = locationError ?? serverErrors.location;

  return (
    <Dialog
      open
      title={m.plants.editTitle}
      description={name}
      onClose={onClose}
      busy={update.isPending}
    >
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="notes"
          validators={{
            onChange: ({ value }) =>
              value.length > NOTES_MAX ? m.plants.notesTooLong(NOTES_MAX) : undefined,
          }}
        >
          {(field) => {
            const error = firstError(field.state.meta.errors) ?? serverErrors.notes;
            const length = field.state.value.length;
            return (
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor={notesId} className={styles.label}>
                    {m.plants.notes}
                  </label>
                  {/* Hidden from screen readers: announcing a count on every
                      keystroke is noise, and going over is announced as an
                      error instead. */}
                  <span
                    className={[styles.count, length > NOTES_MAX ? styles.countOver : '']
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  >
                    {m.plants.notesCount(length, NOTES_MAX)}
                  </span>
                </div>
                {/* No maxLength: it silently truncates a paste, which loses text
                    without saying so. The limit is a visible error instead. */}
                <textarea
                  id={notesId}
                  name={field.name}
                  rows={4}
                  className={[styles.textarea, error ? styles.invalid : '']
                    .filter(Boolean)
                    .join(' ')}
                  placeholder={m.plants.notesPlaceholder}
                  value={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  onBlur={field.handleBlur}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${notesId}-error` : undefined}
                />
                {error ? (
                  <p id={`${notesId}-error`} className={styles.error} aria-live="polite">
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field
          name="observedAt"
          validators={{
            onChange: ({ value }) =>
              value && isInFuture(value) ? m.plants.observedAtFuture : undefined,
          }}
        >
          {(field) => (
            <Field
              label={m.plants.observedAt}
              labelAside={m.plants.optional}
              type="datetime-local"
              name={field.name}
              max={toLocalInputValue(new Date().toISOString())}
              value={field.state.value}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              onBlur={field.handleBlur}
              error={firstError(field.state.meta.errors) ?? serverErrors.observedAt}
            />
          )}
        </form.Field>

        <fieldset className={styles.location}>
          <legend className={styles.label}>{m.plants.location}</legend>
          <p className={styles.locationValue}>
            <MapPin aria-hidden="true" />
            <span>
              {location
                ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
                : m.plants.noLocation}
            </span>
          </p>
          <div className={styles.locationActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={locating}
              onClick={useCurrentLocation}
            >
              <LocateFixed aria-hidden="true" />
              {locating ? m.plants.locating : m.plants.useCurrentLocation}
            </Button>
            {location ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocation(null);
                }}
              >
                {m.plants.removeLocation}
              </Button>
            ) : null}
          </div>
          <p className={styles.error} aria-live="polite">
            {locationMessage}
          </p>
        </fieldset>

        {formError ? (
          <p className={styles.notice} role="alert">
            {formError}
          </p>
        ) : null}

        <div className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={update.isPending}>
            {m.plants.cancel}
          </Button>
          <Button type="submit" loading={update.isPending}>
            {update.isPending ? m.plants.saving : m.plants.save}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
