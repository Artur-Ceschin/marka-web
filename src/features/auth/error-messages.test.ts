import { describe, expect, it } from 'vitest';

import { ApiError, NetworkError } from '@/lib/api-error';
import { MESSAGES } from '@/lib/i18n';

import { describeAuthError } from './error-messages';

const en = MESSAGES.en;
const pt = MESSAGES['pt-BR'];

const apiError = (status: number, code?: string, error?: string) =>
  new ApiError(status, { code, error }, 'fallback');

describe('describeAuthError', () => {
  it('translates a known code instead of echoing the English API text', () => {
    const error = apiError(401, 'INVALID_CREDENTIALS', 'Incorrect username or password.');
    expect(describeAuthError(error, pt).message).toBe('E-mail ou senha incorretos.');
  });

  it('marks code errors so a screen can attach them to its code field', () => {
    expect(describeAuthError(apiError(400, 'INVALID_CODE'), en).code).toBe('invalid');
    expect(describeAuthError(apiError(400, 'EXPIRED_CODE'), en).code).toBe('expired');
  });

  it('pairs account-state errors with a way forward', () => {
    expect(describeAuthError(apiError(409, 'EMAIL_ALREADY_REGISTERED'), en).action).toBe(
      'signInOrReset',
    );
    expect(describeAuthError(apiError(400, 'CANNOT_RESET_PASSWORD'), en).action).toBe(
      'verifyEmail',
    );
  });

  it('puts a rejected password under the password field', () => {
    const view = describeAuthError(apiError(400, 'INVALID_PASSWORD'), en);
    expect(view.fields.password).toBe(en.validation.passwordRejected);
  });

  it('passes validation details through per field', () => {
    const error = new ApiError(
      400,
      { code: 'VALIDATION_ERROR', details: [{ field: 'email', message: 'Email is invalid' }] },
      'fallback',
    );
    expect(describeAuthError(error, en).fields).toEqual({ email: 'Email is invalid' });
  });

  it('hides server internals behind a generic message on a 5xx', () => {
    const error = apiError(500, 'SERVER_ERROR', 'DynamoDB ProvisionedThroughputExceeded');
    expect(describeAuthError(error, en).message).toBe(en.auth.genericError);
  });

  it('falls back to the API text for a code it does not know', () => {
    expect(describeAuthError(apiError(400, 'SOMETHING_NEW', 'Brand new rule'), en).message).toBe(
      'Brand new rule',
    );
  });

  it('says the server could not be reached for a network failure', () => {
    expect(describeAuthError(new NetworkError(new TypeError('fetch failed')), en).message).toBe(
      en.auth.networkError,
    );
  });
});
