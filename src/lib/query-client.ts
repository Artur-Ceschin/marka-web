import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient.
 *
 * Created in a module rather than inline in a component so a re-render can
 * never swap the cache out from under the tree.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Plant records change rarely, so a minute of freshness avoids a
        // refetch every time a component remounts.
        staleTime: 60_000,
        // One retry covers a dropped connection. More than that just delays
        // showing the person an honest error.
        retry: 1,
        // Refetching on every tab focus is the default and it is rarely what
        // anyone wants: it burns requests and makes lists jump.
        refetchOnWindowFocus: false,
      },
    },
  });
}
