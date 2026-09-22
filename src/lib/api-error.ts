import { z } from 'zod';

/**
 * The field-level detail the API returns on a 400.
 *
 * `[{ field, message }]` is rendered straight against the matching form input,
 * so a server-side rule the client does not know about still lands next to the
 * box that caused it.
 */
export const apiErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const detailsSchema = z.array(apiErrorDetailSchema).optional().catch(undefined);

/** The older shape: `{ code, error }` at the top level. */
const flatErrorSchema = z.object({
  code: z.string().optional(),
  // The API puts its human-readable message in `error`, not `message`.
  error: z.string().optional(),
  // An array only on VALIDATION_ERROR; a dev-mode 500 sends a string, which
  // must not make the whole body unparseable.
  details: detailsSchema,
});

/** The profile routes nest it: `{ error: { code, message } }`. */
const nestedErrorSchema = z
  .object({
    error: z.object({
      code: z.string().optional(),
      message: z.string().optional(),
      details: detailsSchema,
    }),
  })
  .transform(({ error }) => ({ code: error.code, error: error.message, details: error.details }));

// Nested first: the flat schema would also accept `{ error: {...} }` by
// ignoring the unknown object, and the code would be lost.
export const apiErrorBodySchema = z.union([nestedErrorSchema, flatErrorSchema]);

export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
export type ApiErrorBodyInput = z.input<typeof apiErrorBodySchema>;

/**
 * Error codes the UI branches on.
 *
 * Named constants rather than inline strings: these drive navigation, so a typo
 * would silently strand someone on the wrong screen.
 */
export const API_ERROR_CODES = {
  /** 403 on sign-in: the account exists but the emailed code was never used. */
  userNotConfirmed: 'USER_NOT_CONFIRMED',
  /** 401 from /auth/refresh: the refresh token is dead, sign in again. */
  sessionExpired: 'SESSION_EXPIRED',
  /** 422 from /identify: PlantNet found no plant in the photo. */
  noMatch: 'NO_MATCH',
  /** 429 from /identify: today's quota is spent; see `retryAfterSeconds`. */
  dailyLimitReached: 'DAILY_LIMIT_REACHED',
  /** 409 from /detections/:id/confirm: it was already confirmed. */
  alreadyConfirmed: 'DETECTION_ALREADY_CONFIRMED',
  /** 401 on sign-in: wrong email or password. */
  invalidCredentials: 'INVALID_CREDENTIALS',
  /** 409 on sign-up: the address already has an account. */
  emailAlreadyRegistered: 'EMAIL_ALREADY_REGISTERED',
  /** 400 on confirm or reset: the code is wrong. */
  invalidCode: 'INVALID_CODE',
  /** 400 on confirm or reset: the code is too old; offer a new one. */
  expiredCode: 'EXPIRED_CODE',
  /** 400 on reset: usually an account that was never verified. */
  cannotResetPassword: 'CANNOT_RESET_PASSWORD',
  /** 400 on sign-up or reset: the password breaks the pool policy. */
  invalidPassword: 'INVALID_PASSWORD',
  /** 429 outside the daily limit: back off and retry shortly. */
  tooManyRequests: 'TOO_MANY_REQUESTS',
  /**
   * Client-side only, never sent by the API: the prepared photo is over the
   * presigned upload's `maxBytes`, caught before S3 would reject it.
   */
  imageTooLarge: 'IMAGE_TOO_LARGE',
  /** 400 from /uploads or /identify: not a JPEG or PNG. */
  invalidImage: 'INVALID_IMAGE',
  /** 404 from /identify: the upload never finished or its 5 minutes ran out. */
  uploadNotFound: 'UPLOAD_NOT_FOUND',
  /** 502 from /identify: PlantNet is down. */
  identificationFailed: 'IDENTIFICATION_FAILED',
  /** 502 from confirm: the enrichment model is down. */
  enrichmentFailed: 'ENRICHMENT_FAILED',
  /** 422 from confirm: show the species without care details. */
  enrichmentRefused: 'ENRICHMENT_REFUSED',
  /** 400 from /auth/google: the code was already used or has expired. */
  invalidAuthorizationCode: 'INVALID_AUTHORIZATION_CODE',
  /** 404 from PATCH /me: no profile row yet. GET /me rebuilds it. */
  profileNotFound: 'PROFILE_NOT_FOUND',
  /** 404 from /detections/:id, including another user's id. */
  detectionNotFound: 'DETECTION_NOT_FOUND',
} as const;

/** Thrown by every non-2xx response. Carries the status and the parsed body. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: ApiErrorDetail[];
  /** From the Retry-After header, when the API says how long to back off. */
  readonly retryAfterSeconds: number | undefined;

  constructor(
    status: number,
    body: ApiErrorBody,
    fallbackMessage: string,
    retryAfterSeconds?: number,
  ) {
    super(body.error ?? fallbackMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details ?? [];
    this.retryAfterSeconds = retryAfterSeconds;
  }

  /** 409 on sign-up: the address already has an account. */
  get isEmailTaken(): boolean {
    return this.status === 409 && this.code === API_ERROR_CODES.emailAlreadyRegistered;
  }

  get isUserNotConfirmed(): boolean {
    return this.status === 403 && this.code === API_ERROR_CODES.userNotConfirmed;
  }

  get isSessionExpired(): boolean {
    return this.status === 401 && this.code === API_ERROR_CODES.sessionExpired;
  }

  /** Field errors keyed by field name, for handing to a form. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const detail of this.details) {
      // First message per field wins; later ones are usually variations of the
      // same rule and showing two under one input helps nobody.
      out[detail.field] ??= detail.message;
    }
    return out;
  }
}

/** A fetch that never reached the server: offline, DNS, CORS, aborted. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('The request could not be sent.');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}
