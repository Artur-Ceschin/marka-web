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

export const apiErrorBodySchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  details: z.array(apiErrorDetailSchema).optional(),
});

export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

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
} as const;

/** Thrown by every non-2xx response. Carries the status and the parsed body. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: ApiErrorDetail[];

  constructor(status: number, body: ApiErrorBody, fallbackMessage: string) {
    super(body.message ?? fallbackMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details ?? [];
  }

  /** 409 on sign-up: the address already has an account. */
  get isEmailTaken(): boolean {
    return this.status === 409;
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
