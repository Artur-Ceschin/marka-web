import { API_ERROR_CODES, ApiError, NetworkError } from '@/lib/api-error';
import type { Locale, Messages } from '@/lib/i18n';

export interface PlantErrorView {
  title: string;
  hint: string | null;
  /**
   * Whether the same photo is worth sending again. False where only a
   * different photo can help, because every attempt uses a daily credit.
   */
  canRetry: boolean;
}

/**
 * Turns anything the identify flow throws into what the panel shows.
 *
 * Translated from the error code rather than displayed from the API, whose
 * text is English whatever the app language. Follows the "what the UI should
 * do" column of the API contract.
 */
export function describePlantError(
  error: unknown,
  m: Messages,
  locale: Locale,
  now: number = Date.now(),
): PlantErrorView {
  const view = (title: string, hint: string | null = null, canRetry = false): PlantErrorView => ({
    title,
    hint,
    canRetry,
  });

  if (error instanceof NetworkError) return view(m.auth.networkError, null, true);
  // What createImageBitmap throws for a format this browser cannot decode,
  // typically an iPhone HEIC outside Safari. Resending cannot fix it.
  if (error instanceof DOMException) return view(m.plants.unreadablePhoto);
  if (!(error instanceof ApiError)) return view(m.auth.genericError, null, true);

  switch (error.code) {
    case API_ERROR_CODES.noMatch:
      return view(m.plants.noMatchTitle, m.plants.noMatchHint);
    case API_ERROR_CODES.dailyLimitReached: {
      if (error.retryAfterSeconds === undefined) {
        return view(m.plants.dailyLimitTitle, m.plants.dailyLimitTomorrow);
      }
      // The limit resets at midnight UTC; shown in the reader's own clock.
      const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
        new Date(now + error.retryAfterSeconds * 1000),
      );
      return view(m.plants.dailyLimitTitle, m.plants.dailyLimitAt(time));
    }
    case API_ERROR_CODES.invalidImage:
      return view(m.plants.invalidImage);
    case API_ERROR_CODES.imageTooLarge:
      return view(m.plants.imageTooLarge);
    case API_ERROR_CODES.uploadNotFound:
      return view(m.plants.uploadExpired, null, true);
    case API_ERROR_CODES.tooManyRequests:
      return view(m.auth.tooManyRequests, null, true);
    case API_ERROR_CODES.identificationFailed:
    case API_ERROR_CODES.enrichmentFailed:
      return view(m.plants.providerDown, null, true);
    default:
      break;
  }

  if (error.status >= 500) return view(m.plants.providerDown, null, true);
  return view(error.message || m.auth.genericError, null, true);
}
