import type { z } from 'zod';

import { ApiError, apiErrorBodySchema, NetworkError } from './api-error';
import { config } from './config';

export interface RequestOptions<TResponse> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /**
   * Schema for a successful response. Every response is parsed: an API that
   * changes shape should fail loudly here rather than produce `undefined`
   * three components deep.
   */
  schema?: z.ZodType<TResponse>;
  /** Bearer token. Omitted for the auth endpoints, which are unauthenticated. */
  token?: string | undefined;
  signal?: AbortSignal | undefined;
}

function retryAfterSeconds(response: Response): number | undefined {
  const seconds = Number(response.headers.get('Retry-After'));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

export async function request<TResponse = unknown>(
  path: string,
  { method = 'GET', body, schema, token, signal }: RequestOptions<TResponse> = {},
): Promise<TResponse> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  // The API writes common names and care text in this language. I18nProvider
  // keeps <html lang> in step with the chosen locale, so reading it here needs
  // no React and cannot drift from the language the page is showing.
  const lang = typeof document === 'undefined' ? '' : document.documentElement.lang;
  if (lang) headers['Accept-Language'] = lang;

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ?? null,
    });
  } catch (cause) {
    // fetch only rejects when the request never completed. Distinguishing that
    // from an HTTP error matters: one is worth retrying, the other is not.
    throw new NetworkError(cause);
  }

  if (!response.ok) {
    // An error body is best-effort: a gateway 502 is often HTML, and a 204 has
    // no body at all. Parse what we can and fall back to the status text.
    const raw: unknown = await response.json().catch(() => ({}));
    const parsed = apiErrorBodySchema.safeParse(raw);
    throw new ApiError(
      response.status,
      parsed.success ? parsed.data : {},
      response.statusText || `Request failed with status ${response.status}`,
      retryAfterSeconds(response),
    );
  }

  if (!schema) return undefined as TResponse;

  const raw: unknown = await response.json().catch(() => null);
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Unexpected response shape from ${path}: ${result.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('; ')}`,
    );
  }
  return result.data;
}
