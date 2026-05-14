'use client';

import { useQuery } from '@tanstack/react-query';
import { plants } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function usePlant(latin: string | null) {
  return useQuery({
    queryKey: queryKeys.plants.byLatin(latin ?? ''),
    queryFn: () => plants.getByLatin(latin!),
    enabled: !!latin,
  });
}
