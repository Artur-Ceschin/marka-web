import { z } from 'zod';
import { presignedUploadSchema, uploadPhoto } from '@/lib/api/uploads';
import { API_ERROR_CODES, ApiError } from '@/lib/api-error';
import { authorizedRequest } from '@/lib/auth/session';

import { prepareAvatar } from '../lib/prepare-avatar';

/**
 * The signed-in person's profile.
 *
 * `name`, `bio` and `avatarUrl` are lenient on purpose: they are absent until
 * they are set, and an account created before profiles existed has none of
 * them. A strict schema would turn an empty profile into a failed request.
 */
export const homeLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export type HomeLocation = z.infer<typeof homeLocationSchema>;

export const profileSchema = z.object({
  userId: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
  /**
   * Presigned, signed on the hour and valid for two. Two reads in the same
   * hour give a byte-identical URL, which is what lets the browser reuse the
   * cached image, so it is never cache-busted and never stored: re-read /me.
   */
  avatarUrl: z.url().nullish(),
  /** A default offered when identifying; the API never applies it itself. */
  homeLocation: homeLocationSchema.nullish(),
  /**
   * Derived server-side from the coordinates, in the language of the
   * Accept-Language sent when it was saved. Write-only from our side: the API
   * rejects a name sent by a client, so a label can never contradict its own
   * coordinates. Absent when the lookup failed or the point has no locality.
   */
  homeLocationName: z.string().nullish(),
  updatedAt: z.string().nullish(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

/** Send only what changed; `null` clears a value. */
export interface ProfileChanges {
  name?: string | null;
  bio?: string | null;
  /** Write-only: the key from an avatar upload, never a URL. */
  avatarKey?: string | null;
  /**
   * Sent at full precision. The API stores it rounded to two decimals and
   * returns the rounded value, so render what comes back rather than what was
   * sent, or the field looks like it failed to save.
   */
  homeLocation?: HomeLocation | null;
}

export function getMe(): Promise<Profile> {
  return authorizedRequest('/me', { schema: profileSchema });
}

export function updateProfile(changes: ProfileChanges): Promise<Profile> {
  return authorizedRequest('/me', { method: 'PATCH', body: changes, schema: profileSchema });
}

/**
 * The place name for coordinates that have not been saved yet.
 *
 * Nothing is stored: this is only so a location just picked reads as a place
 * rather than as numbers. Lenient about the field name, and about failing:
 * a preview that does not answer is not worth an error on screen, since
 * saving resolves the name anyway.
 */
const previewSchema = z.object({
  name: z.string().nullish(),
  homeLocationName: z.string().nullish(),
});

export async function previewHomeLocationName(location: HomeLocation): Promise<string | null> {
  try {
    const result = await authorizedRequest('/me/home-location/preview', {
      method: 'POST',
      body: location,
      schema: previewSchema,
    });
    return result.name ?? result.homeLocationName ?? null;
  } catch {
    return null;
  }
}

/** The avatar has its own upload slot, separate from plant photos. */
export function createAvatarUpload(contentType: 'image/jpeg' | 'image/png') {
  return authorizedRequest('/me/avatar-upload', {
    method: 'POST',
    body: { contentType },
    schema: presignedUploadSchema,
  });
}

/**
 * Crop, upload, and give back the key to save on the profile.
 *
 * Steps one and two only park a file in S3: it is deleted within seven days
 * unless a PATCH commits the key, and committing replaces the old picture for
 * good. The slot expires after five minutes, so the upload runs as soon as a
 * photo is chosen rather than when the form is saved.
 */
export async function uploadAvatar(file: Blob): Promise<string> {
  // Always JPEG: the canvas re-encodes, which is also what turns a HEIC photo
  // into something the API accepts.
  const image = await prepareAvatar(file);
  const upload = await createAvatarUpload('image/jpeg');
  // Checked before S3 sees it: S3 would reject it anyway, but only with an
  // opaque upload failure.
  if (image.size > upload.maxBytes) {
    const message = 'That photo is too large to upload.';
    throw new ApiError(400, { code: API_ERROR_CODES.imageTooLarge, error: message }, message);
  }
  await uploadPhoto(upload, image);
  return upload.key;
}
