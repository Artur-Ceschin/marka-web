import { z } from 'zod';

import { ApiError, NetworkError } from '../api-error';
import { authorizedRequest } from '../auth/session';

/**
 * Presigned uploads to S3.
 *
 * Shared rather than owned by a feature: plant photos and profile pictures
 * both go through the same two steps, and a feature may not import from a
 * sibling feature.
 */
export const presignedUploadSchema = z.object({
  url: z.url(),
  fields: z.record(z.string(), z.string()),
  key: z.string(),
  maxBytes: z.number(),
  expiresIn: z.number(),
});

export type PresignedUpload = z.infer<typeof presignedUploadSchema>;

export function createUpload(contentType: 'image/jpeg' | 'image/png') {
  return authorizedRequest('/uploads', {
    method: 'POST',
    body: { contentType },
    schema: presignedUploadSchema,
  });
}

/**
 * Sends the image straight to S3 with the presigned POST.
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
