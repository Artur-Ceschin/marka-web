'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { explore, type NearbyPlantsPage } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useNearbyPlants(lat: number, lng: number, radius: number, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.explore.nearby(lat, lng, radius),
    queryFn: ({ pageParam }) => explore.nearby(lat, lng, pageParam, radius),
    initialPageParam: 0,
    getNextPageParam: (last: NearbyPlantsPage) => (last.hasMore ? last.page + 1 : undefined),
    enabled,
  });
}
