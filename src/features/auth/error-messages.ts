import { API_ERROR_CODES, ApiError, NetworkError } from '@/lib/api-error';
import type { Messages } from '@/lib/i18n';

export type AuthErrorAction = 'signInOrReset' | 'verifyEmail';

export interface AuthErrorView {
  message: string;
  /** Messages keyed by field name, for errors that belong under an input. */
  fields: Record<string, string>;
  action: AuthErrorAction | null;
  /** Set for code errors, so a screen can attach them to its code field. */
  code: 'invalid' | 'expired' | null;
}

export function describeAuthError(error: unknown, m: Messages): AuthErrorView {
  const view = (message: string, extra: Partial<AuthErrorView> = {}): AuthErrorView => ({
    message,
    fields: {},
    action: null,
    code: null,
    ...extra,
  });

  if (error instanceof NetworkError) return view(m.auth.networkError);
  if (!(error instanceof ApiError)) return view(m.auth.genericError);

  switch (error.code) {
    case API_ERROR_CODES.invalidCredentials:
      return view(m.auth.invalidCredentials);
    case API_ERROR_CODES.emailAlreadyRegistered:
      return view(m.auth.emailTaken, { action: 'signInOrReset' });
    case API_ERROR_CODES.invalidCode:
      return view(m.verify.codeIncorrect, { code: 'invalid' });
    case API_ERROR_CODES.expiredCode:
      return view(m.verify.codeExpired, { code: 'expired' });
    case API_ERROR_CODES.cannotResetPassword:
      return view(m.auth.cannotReset, { action: 'verifyEmail' });
    case API_ERROR_CODES.invalidPassword:
      return view(m.validation.passwordRejected, {
        fields: { password: m.validation.passwordRejected },
      });
    case API_ERROR_CODES.tooManyRequests:
      return view(m.auth.tooManyRequests);
    default:
      break;
  }

  const fields = error.fieldErrors();
  if (Object.keys(fields).length > 0) {
    return view(Object.values(fields)[0] ?? m.auth.genericError, { fields });
  }

  // A 5xx message is for logs, not people.
  if (error.status >= 500) return view(m.auth.genericError);
  return view(error.message || m.auth.genericError);
}
