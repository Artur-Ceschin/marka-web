import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { ApiError } from '@/lib/api-error';

import {
  type Detection,
  type DetectionChanges,
  deleteDetection,
  listIdentifications,
  updateDetection,
} from './identify-api';

/**
 * Query keys for the plants feature.
 *
 * A factory rather than string arrays scattered through components, so
 * invalidating everything in the feature is `plantKeys.all`, and a typo in a
 * key is a compile error instead of a cache that silently never refreshes.
 */
export const plantKeys = {
  all: ['plants'] as const,
  identifications: () => [...plantKeys.all, 'identifications'] as const,
};

const PAGE_SIZE = 20;

/** The catalogue, newest first, a page at a time. */
export function useIdentifications() {
  return useInfiniteQuery({
    queryKey: plantKeys.identifications(),
    queryFn: ({ pageParam }) => listIdentifications({ limit: PAGE_SIZE, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    // Absent on the last page, which is exactly what ends pagination.
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // authorizedRequest already refreshes and retries once on a 401.
    retry: false,
    // Every imageUrl is a signed link valid for up to an hour. Refetching well
    // inside that window keeps the thumbnails loadable without ever storing a
    // link that is about to expire.
    refetchInterval: 45 * 60_000,
  });
}

type CataloguePages = InfiniteData<
  Awaited<ReturnType<typeof listIdentifications>>,
  string | undefined
>;

/**
 * Rewrites the cached catalogue in place, across every loaded page.
 *
 * Editing the cache rather than refetching keeps the grid exactly where it
 * was: no flash of the loading state, and no pages beyond the first thrown
 * away and loaded again.
 */
function useEditCatalogue() {
  const queryClient = useQueryClient();
  return (change: (items: Detection[]) => Detection[]) => {
    queryClient.setQueryData<CataloguePages>(plantKeys.identifications(), (data) =>
      data
        ? { ...data, pages: data.pages.map((page) => ({ ...page, items: change(page.items) })) }
        : data,
    );
  };
}

const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

export function useUpdateDetection() {
  const editCatalogue = useEditCatalogue();
  return useMutation({
    mutationFn: ({ detectionId, changes }: { detectionId: string; changes: DetectionChanges }) =>
      updateDetection(detectionId, changes),
    onSuccess: (updated) => {
      editCatalogue((items) =>
        items.map((item) => (item.detectionId === updated.detectionId ? updated : item)),
      );
    },
    onError: (error, { detectionId }) => {
      // Deleted elsewhere, in another tab or on another device.
      if (isNotFound(error)) {
        editCatalogue((items) => items.filter((item) => item.detectionId !== detectionId));
      }
    },
  });
}

export function useDeleteDetection() {
  const queryClient = useQueryClient();
  const editCatalogue = useEditCatalogue();
  return useMutation({
    mutationFn: async (detectionId: string) => {
      try {
        await deleteDetection(detectionId);
      } catch (error) {
        // Already gone is exactly the outcome that was asked for.
        if (!isNotFound(error)) throw error;
      }
    },
    onSuccess: (_result, detectionId) => {
      editCatalogue((items) => items.filter((item) => item.detectionId !== detectionId));
      // Not optimistic: for something that cannot be undone, the card only
      // disappears once the server has really removed it. The refetch then
      // realigns the page boundaries the removal shifted.
      void queryClient.invalidateQueries({ queryKey: plantKeys.identifications() });
    },
  });
}
