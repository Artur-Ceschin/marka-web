import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authorizedRequest } from '@/lib/auth/session';

/**
 * Query keys for the plants feature.
 *
 * A factory rather than string arrays scattered through components, so
 * invalidating everything in the feature is `plantKeys.all`, and a typo in a
 * key is a compile error instead of a cache that silently never refreshes.
 */
export const plantKeys = {
  all: ['plants'] as const,
  identify: () => [...plantKeys.all, 'identify'] as const,
};

/**
 * One authenticated round trip to the API.
 *
 * Proves the whole chain on the first screen after sign-in: the id token is
 * attached, refreshed when needed, and accepted. Nothing depends on the shape of
 * the response, only on the call succeeding.
 */
export function useIdentifyCheck() {
  return useQuery({
    queryKey: plantKeys.identify(),
    queryFn: () => authorizedRequest('/identify', { schema: z.unknown() }),
    // authorizedRequest already refreshes and retries once on a 401. A second
    // retry layer here would multiply requests without changing the outcome.
    retry: false,
  });
}
