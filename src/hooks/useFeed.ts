'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feed, type FeedItem } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.list(),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: { items: FeedItem[]; cursor: string | null }) =>
      last.cursor ?? undefined,
  });
}

export function useLikeFeedEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, entryOwnerId }: { entryId: string; entryOwnerId: string }) =>
      feed.like(entryId, entryOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.list() });
    },
  });
}
