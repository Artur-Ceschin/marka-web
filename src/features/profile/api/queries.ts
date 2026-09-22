import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { API_ERROR_CODES, ApiError } from '@/lib/api-error';

import { getMe, type Profile, type ProfileChanges, updateProfile } from './profile-api';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
};

export function useProfile() {
  return useQuery({ queryKey: profileKeys.me(), queryFn: getMe });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: ProfileChanges) => {
      try {
        return await updateProfile(changes);
      } catch (error) {
        // A Google sign-up whose profile row was never written: PATCH cannot
        // create one, GET /me can. Rebuild it and save again, once.
        const missing =
          error instanceof ApiError &&
          error.status === 404 &&
          error.code === API_ERROR_CODES.profileNotFound;
        if (!missing) throw error;
        await getMe();
        return await updateProfile(changes);
      }
    },
    // The response is the updated profile, so the cache is written from it
    // rather than refetched. A refetch would also mean a new signed avatar
    // URL and a needless redownload of the picture.
    onSuccess: (profile: Profile) => {
      queryClient.setQueryData(profileKeys.me(), profile);
    },
  });
}
