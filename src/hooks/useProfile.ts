'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { users, type UpdateProfileBody } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: users.me,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileBody) => users.updateMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
