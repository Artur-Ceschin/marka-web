'use client';

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { identify, SubmitResponse, type SaveNotebookBody } from '@/lib/api';
import { queryKeys } from './queryKeys';
export function useIdentifySubmit(
  options?: Omit<UseMutationOptions<SubmitResponse, Error, File>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: (file: File) => identify.submit(file),
    ...options,
  });
}

export function useSaveIdentification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveNotebookBody) => identify.save(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notebook.list() });
    },
  });
}
