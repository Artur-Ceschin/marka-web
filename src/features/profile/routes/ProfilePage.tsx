import { useForm } from '@tanstack/react-form';
import { BadgeCheck, LocateFixed, MapPin, Trash2, Upload, UserRound } from 'lucide-react';
import { useId, useRef, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { API_ERROR_CODES, ApiError } from '@/lib/api-error';
import { type HomeLocation, previewHomeLocationName, uploadAvatar } from '../api/profile-api';
import { useProfile, useUpdateProfile } from '../api/queries';

import styles from './ProfilePage.module.scss';

export const NAME_MAX = 80;
export const BIO_MAX = 500;

const ACCEPTED = ['image/jpeg', 'image/png'];

function firstError(errors: readonly unknown[]): string | undefined {
  return errors.find((error): error is string => typeof error === 'string');
}

/** Initials as a fallback picture, so an empty profile still looks deliberate. */
function initials(name: string | null | undefined, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) {
    // First and last word: "Artur Ceschin" gives AC, a middle name is skipped.
    const words = trimmed.split(/\s+/).filter(Boolean);
    const first = words[0]?.[0] ?? '';
    const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  }
  // From an address, one letter only: "ar" from artur@... reads as a word
  // fragment rather than as initials.
  return (email.trim()[0] ?? '').toUpperCase();
}

/** Name, a short bio, and a picture. */
export function ProfilePage() {
  const { m, locale } = useI18n();
  const query = useProfile();
  const update = useUpdateProfile();
  const bioId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatarKey, setAvatarKey] = useState<string | null | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // `undefined` means untouched, `null` means cleared.
  const [homeLocation, setHomeLocation] = useState<HomeLocation | null | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);
  // Only the newest pick may write a name: two quick presses must not let a
  // slow first answer label the second location.
  const pickId = useRef(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const profile = query.data;
  const initialName = profile?.name ?? '';
  const initialBio = profile?.bio ?? '';

  const form = useForm({
    defaultValues: { name: initialName, bio: initialBio },
    onSubmit: async ({ value }) => {
      const changes: Parameters<typeof update.mutateAsync>[0] = {};
      const name = value.name.trim();
      const bio = value.bio.trim();
      if (name !== initialName.trim()) changes.name = name || null;
      if (bio !== initialBio.trim()) changes.bio = bio || null;
      if (avatarKey !== undefined) changes.avatarKey = avatarKey;
      // Full precision: the API rounds it to two decimals and returns that.
      if (homeLocation !== undefined) changes.homeLocation = homeLocation;

      if (Object.keys(changes).length === 0) {
        setSaved(true);
        return;
      }

      setFormError(null);
      setServerErrors({});
      try {
        await update.mutateAsync(changes);
        setAvatarKey(undefined);
        setAvatarPreview(null);
        // Cleared so the rounded value and stored name the API returned are
        // what show.
        setHomeLocation(undefined);
        setPickedName(null);
        setSaved(true);
      } catch (error) {
        if (error instanceof ApiError && error.code === API_ERROR_CODES.uploadNotFound) {
          // The parked upload is gone, or never finished. That step has to
          // start again; everything else the person typed stays.
          setAvatarKey(undefined);
          setAvatarPreview(null);
          setFormError(m.profile.uploadExpired);
          return;
        }
        const fields = error instanceof ApiError ? error.fieldErrors() : {};
        setServerErrors(fields);
        if (Object.keys(fields).length === 0) {
          setFormError(error instanceof ApiError ? error.message : m.profile.saveFailed);
        }
      }
    },
  });

  async function chooseAvatar(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      setFormError(m.profile.wrongType);
      return;
    }
    setFormError(null);
    setSaved(false);
    setUploading(true);
    try {
      const key = await uploadAvatar(file);
      setAvatarKey(key);
      // Shown straight from the chosen file: no wait for a signed URL, and it
      // is revoked when it is replaced.
      setAvatarPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return URL.createObjectURL(file);
      });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : m.profile.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  if (query.isPending) {
    return (
      <div className={styles.page}>
        <AppBar />
        <main id="main" className={styles.main}>
          <p role="status">{m.common.loading}</p>
        </main>
      </div>
    );
  }

  if (query.isError || !profile) {
    return (
      <div className={styles.page}>
        <AppBar />
        <main id="main" className={styles.main}>
          <p className={styles.error}>{m.profile.loadFailed}</p>
          <Button
            variant="secondary"
            onClick={() => {
              void query.refetch();
            }}
          >
            {m.plants.tryAgain}
          </Button>
        </main>
      </div>
    );
  }

  const shownAvatar = avatarPreview ?? (avatarKey === null ? null : profile.avatarUrl);
  const shownHome = homeLocation === undefined ? profile.homeLocation : homeLocation;
  const coordinates = shownHome
    ? `${shownHome.latitude.toFixed(2)}, ${shownHome.longitude.toFixed(2)}`
    : null;
  // The place name is resolved by the API when the location is saved, so a
  // location just picked has none yet. Rather than printing raw numbers as if
  // they were the answer, the pending pick is named for what it is, with the
  // coordinates beside it and the name arriving on save.
  const pendingPick = homeLocation !== undefined && homeLocation !== null;
  // Removed and not yet saved: the stored name must not survive the removal,
  // or clearing the field looks like it did nothing.
  const cleared = homeLocation === null;
  const homeLabel = cleared
    ? null
    : pendingPick
      ? (pickedName ?? m.profile.pickedLocation)
      : (profile.homeLocationName ?? coordinates);

  function useHomeLocation() {
    if (!('geolocation' in navigator)) {
      setLocationError(m.profile.locationFailed);
      return;
    }
    setLocating(true);
    setLocationError(null);
    setSaved(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const picked = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setHomeLocation(picked);
        setPickedName(null);

        // Named before saving, so the choice reads as a place. The name is
        // resolved again on save and stored then; this one is never sent.
        pickId.current += 1;
        const id = pickId.current;
        void previewHomeLocationName(picked).then((name) => {
          if (name && pickId.current === id) setPickedName(name);
        });
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? m.profile.locationDenied
            : m.profile.locationFailed,
        );
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  }
  const created = new Date(profile.createdAt);

  return (
    <div className={styles.page}>
      <AppBar />
      <main id="main" className={styles.main}>
        <h1 className={styles.title}>{m.profile.title}</h1>
        <p className={styles.subtitle}>{m.profile.subtitle}</p>

        <form
          className={styles.form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <section className={styles.photoRow}>
            <div className={styles.avatar}>
              {shownAvatar ? (
                <img src={shownAvatar} alt="" width={96} height={96} />
              ) : (
                <span className={styles.initials} aria-hidden="true">
                  {initials(profile.name, profile.email) || <UserRound />}
                </span>
              )}
            </div>

            <div className={styles.photoActions}>
              <p className={styles.label}>{m.profile.photo}</p>
              <div className={styles.photoButtons}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload aria-hidden="true" />
                  {uploading ? m.profile.uploading : m.profile.changePhoto}
                </Button>
                {shownAvatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAvatarKey(null);
                      setAvatarPreview(null);
                      setSaved(false);
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                    {m.profile.removePhoto}
                  </Button>
                ) : null}
              </div>
              <p className={styles.hint}>{m.profile.photoHint}</p>
              {/* No `capture`: on a phone this offers the camera and the photo
                  library, rather than forcing the camera. */}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png"
                className={styles.file}
                aria-label={m.profile.changePhoto}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  // Cleared so choosing the same file twice fires again.
                  event.target.value = '';
                  if (file) void chooseAvatar(file);
                }}
              />
            </div>
          </section>

          <fieldset className={styles.location}>
            <legend className={styles.label}>{m.profile.homeLocation}</legend>
            <p className={styles.locationValue}>
              <MapPin aria-hidden="true" />
              {/* Name first, coordinates as the fallback: a lookup that found
                  no locality must never look like a lost location. */}
              <span title={coordinates ?? undefined}>{homeLabel ?? m.profile.noLocation}</span>
              {pendingPick && coordinates ? (
                <span className={styles.pendingCoords}>{coordinates}</span>
              ) : null}
            </p>
            <div className={styles.photoButtons}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={locating}
                onClick={useHomeLocation}
              >
                <LocateFixed aria-hidden="true" />
                {locating ? m.profile.locating : m.profile.useCurrentLocation}
              </Button>
              {shownHome ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    pickId.current += 1;
                    setHomeLocation(null);
                    setPickedName(null);
                    setSaved(false);
                  }}
                >
                  {m.profile.removeLocation}
                </Button>
              ) : null}
            </div>
            <p className={styles.hint}>
              {pendingPick && !pickedName
                ? m.profile.pickedLocationHint
                : m.profile.homeLocationHint}
            </p>
            <p className={styles.error} aria-live="polite">
              {locationError ?? serverErrors.homeLocation}
            </p>
          </fieldset>

          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                value.length > NAME_MAX ? m.profile.nameTooLong(NAME_MAX) : undefined,
            }}
          >
            {(field) => (
              <Field
                label={m.profile.name}
                name={field.name}
                autoComplete="name"
                placeholder={m.profile.namePlaceholder}
                value={field.state.value}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                  setSaved(false);
                }}
                onBlur={field.handleBlur}
                error={firstError(field.state.meta.errors) ?? serverErrors.name}
              />
            )}
          </form.Field>

          <form.Field
            name="bio"
            validators={{
              onChange: ({ value }) =>
                value.length > BIO_MAX ? m.profile.bioTooLong(BIO_MAX) : undefined,
            }}
          >
            {(field) => {
              const error = firstError(field.state.meta.errors) ?? serverErrors.bio;
              const length = field.state.value.length;
              return (
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label htmlFor={bioId} className={styles.label}>
                      {m.profile.bio}
                    </label>
                    <span
                      className={[styles.count, length > BIO_MAX ? styles.countOver : '']
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden="true"
                    >
                      {m.plants.notesCount(length, BIO_MAX)}
                    </span>
                  </div>
                  <textarea
                    id={bioId}
                    name={field.name}
                    rows={4}
                    className={[styles.textarea, error ? styles.invalid : '']
                      .filter(Boolean)
                      .join(' ')}
                    placeholder={m.profile.bioPlaceholder}
                    value={field.state.value}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      setSaved(false);
                    }}
                    onBlur={field.handleBlur}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${bioId}-error` : undefined}
                  />
                  {error ? (
                    <p id={`${bioId}-error`} className={styles.error} aria-live="polite">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          {/* Read-only: the address is the account, and changing it is a
              verification flow of its own, not a text box. */}
          <dl className={styles.account}>
            <dt className={styles.label}>{m.profile.email}</dt>
            <dd className={styles.accountValue}>
              {profile.email}
              {profile.emailVerified ? (
                <span className={styles.verified}>
                  <BadgeCheck aria-hidden="true" />
                  {m.profile.verified}
                </span>
              ) : null}
            </dd>
            {Number.isNaN(created.getTime()) ? null : (
              <>
                <dt className={styles.label}>{m.profile.memberSince}</dt>
                <dd className={styles.accountValue}>
                  <time dateTime={profile.createdAt}>
                    {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(created)}
                  </time>
                </dd>
              </>
            )}
          </dl>

          {formError ? (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          ) : null}

          <div className={styles.footer}>
            <p className={styles.savedNote} role="status">
              {saved ? m.profile.saved : ''}
            </p>
            <Button type="submit" loading={update.isPending} disabled={uploading}>
              {update.isPending ? m.profile.saving : m.profile.save}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
