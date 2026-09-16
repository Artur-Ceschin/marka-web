import { z } from 'zod';

import { API_ERROR_CODES, ApiError, NetworkError } from '@/lib/api-error';
import { authorizedRequest } from '@/lib/auth/session';

import { prepareImage } from '../lib/prepare-image';

/**
 * The identification flow, in the order the UI runs it:
 * createUpload → uploadPhoto (straight to S3) → identify → confirmDetection.
 * `identifyPhoto` bundles the first three as the single "identify" action.
 */

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  /** Meters, as `GeolocationCoordinates.accuracy` reports it. */
  accuracy: z.number().optional(),
});
const certaintySchema = z.enum(['high', 'low']);
const statusSchema = z.enum(['pending_confirmation', 'confirmed', 'rejected']);

export const presignedUploadSchema = z.object({
  url: z.url(),
  fields: z.record(z.string(), z.string()),
  key: z.string(),
  maxBytes: z.number(),
  expiresIn: z.number(),
});

/**
 * One PlantNet match.
 *
 * Lenient on the descriptive fields on purpose. The daily limit is charged on
 * the attempt, so if a real match arrived with a null `family` and a strict
 * schema rejected the whole response, the user would lose a credit AND see an
 * error for an identification that worked. `species` stays strict because
 * confirming a match needs it verbatim.
 */
/**
 * A reference photo of a candidate species, so a person can compare it with
 * their own plant. NOT in the API contract yet: this is the shape proposed to
 * the backend (PlantNet's related images). Until it ships the list is empty
 * and matches simply render without thumbnails.
 */
export const candidateImageSchema = z.object({
  url: z.url(),
  organ: z.string().nullish(),
  author: z.string().nullish(),
  license: z.string().nullish(),
});

export const plantCandidateSchema = z.object({
  species: z.string(),
  scientificName: z.string(),
  commonNames: z.array(z.string()).catch([]),
  family: z.string().nullish(),
  genus: z.string().nullish(),
  confidence: z.number().min(0).max(1),
  // Absent or malformed is an empty list, never a failed identification.
  images: z.array(candidateImageSchema).catch([]),
});

export const enrichmentSchema = z.object({
  description: z.string(),
  care: z.string(),
  toxicity: z.string(),
  nativeStatus: z.string(),
});

/**
 * Nothing is stored by /identify. `identificationToken` is the signed result:
 * send it back with the chosen species to save a detection. Opaque, and valid
 * for `expiresIn` seconds (24 hours).
 */
export const identifyResponseSchema = z.object({
  identificationToken: z.string(),
  expiresIn: z.number(),
  candidates: z.array(plantCandidateSchema),
  /** Decided server-side so every client draws the same line. */
  certainty: certaintySchema,
  timestamp: z.string(),
  quota: z.object({ used: z.number(), limit: z.number(), remaining: z.number() }),
});

export const detectionSchema = z.object({
  detectionId: z.string(),
  /** Signed and short-lived; refetch the list rather than storing it. */
  imageUrl: z.url(),
  candidates: z.array(plantCandidateSchema),
  certainty: certaintySchema,
  status: statusSchema,
  location: locationSchema.optional(),
  /** When the plant was seen; `createdAt` is when it was identified. */
  observedAt: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  confirmedSpecies: z.string().optional(),
  enrichment: enrichmentSchema.optional(),
  confirmedAt: z.string().optional(),
  /**
   * The language `enrichment` was written in, fixed when the species was
   * saved. Absent on detections saved before languages existed: English.
   */
  locale: z.string().optional(),
});

export const identificationsPageSchema = z.object({
  items: z.array(detectionSchema),
  /** Opaque: pass it back as `cursor`, never parse it. */
  nextCursor: z.string().optional(),
});

export type PresignedUpload = z.infer<typeof presignedUploadSchema>;
export type Location = z.infer<typeof locationSchema>;
export type IdentifyResponse = z.infer<typeof identifyResponseSchema>;
export type Detection = z.infer<typeof detectionSchema>;
export type PlantCandidate = z.infer<typeof plantCandidateSchema>;
export type Enrichment = z.infer<typeof enrichmentSchema>;
export type ConfirmResponse = Detection;

export function createUpload(contentType: 'image/jpeg' | 'image/png') {
  return authorizedRequest('/uploads', {
    method: 'POST',
    body: { contentType },
    schema: presignedUploadSchema,
  });
}

/**
 * Sends the photo straight to S3 with the presigned POST.
 *
 * Not through `request`: this is S3, not our API: no bearer token, no JSON,
 * and success is an empty 204. Every `fields` entry must come before the file
 * or S3 rejects the policy; S3 itself enforces the size limit.
 */
export async function uploadPhoto(upload: PresignedUpload, photo: Blob): Promise<void> {
  const form = new FormData();
  for (const [name, value] of Object.entries(upload.fields)) {
    form.append(name, value);
  }
  form.append('file', photo);

  let response: Response;
  try {
    response = await fetch(upload.url, { method: 'POST', body: form });
  } catch (cause) {
    throw new NetworkError(cause);
  }

  if (!response.ok) {
    throw new ApiError(response.status, {}, 'The photo could not be uploaded.');
  }
}

/** `observedAt` is ISO 8601 with an offset, ideally from the photo's EXIF. */
export function identify(input: { key: string; location?: Location; observedAt?: string }) {
  return authorizedRequest('/identify', {
    method: 'POST',
    body: input,
    schema: identifyResponseSchema,
  });
}

/** Resize → presign → upload → identify, as one action for the UI. */
/** The steps of `identifyPhoto` a person can see progress through. */
export type IdentifyStage = 'preparing' | 'uploading' | 'identifying';

export async function identifyPhoto(
  photo: Blob,
  location?: Location,
  onStage?: (stage: IdentifyStage) => void,
): Promise<IdentifyResponse> {
  onStage?.('preparing');
  const image = await prepareImage(photo);
  onStage?.('uploading');
  const upload = await createUpload('image/jpeg');
  // Checked here, before sending anything to S3: S3 would reject it anyway,
  // but only with an opaque upload failure. Presigning costs nothing, and the
  // identification credit is only charged later, by /identify.
  if (image.size > upload.maxBytes) {
    const message = 'The photo is larger than the upload limit.';
    throw new ApiError(400, { code: API_ERROR_CODES.imageTooLarge, error: message }, message);
  }
  await uploadPhoto(upload, image);
  // The slow step (roughly 5 to 15 seconds), so the one worth saying out loud.
  onStage?.('identifying');
  return identify(location ? { key: upload.key, location } : { key: upload.key });
}

// Detection ids contain `#` and `:`. Unencoded, the browser reads everything
// after `#` as a URL fragment and the request never reaches the route.
const detectionPath = (detectionId: string) => `/detections/${encodeURIComponent(detectionId)}`;

export function getDetection(detectionId: string) {
  return authorizedRequest(detectionPath(detectionId), { schema: detectionSchema });
}

/** Send only what changed. `null` removes a value, and so does a blank note. */
export interface DetectionChanges {
  notes?: string | null;
  observedAt?: string | null;
  location?: Location | null;
}

export function updateDetection(detectionId: string, changes: DetectionChanges) {
  return authorizedRequest(detectionPath(detectionId), {
    method: 'PATCH',
    body: changes,
    schema: detectionSchema,
  });
}

/** Removes the detection and its photo. The daily credit is not refunded. */
export async function deleteDetection(detectionId: string): Promise<void> {
  await authorizedRequest(detectionPath(detectionId), { method: 'DELETE' });
}

/**
 * Saves the chosen species: the only call that stores a detection and its
 * photo. `enrichment` is absent when the model declined to describe the
 * species. 409 DETECTION_ALREADY_CONFIRMED if this result was already saved;
 * 410 IDENTIFICATION_EXPIRED after 24 hours.
 */
export function confirmDetection(identificationToken: string, species: string) {
  return authorizedRequest('/detections', {
    method: 'POST',
    body: { identificationToken, species },
    schema: detectionSchema,
  });
}

export function listIdentifications(options: { limit?: number; cursor?: string | undefined } = {}) {
  const query = new URLSearchParams({ limit: String(options.limit ?? 20) });
  if (options.cursor) {
    query.set('cursor', options.cursor);
  }

  return authorizedRequest(`/identifications?${query}`, { schema: identificationsPageSchema });
}
