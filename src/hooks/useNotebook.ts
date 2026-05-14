'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notebook, type SaveNotebookBody } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useNotebook() {
  return useQuery({
    queryKey: queryKeys.notebook.list(),
    queryFn: () => notebook.list().then((r) => r.items),
  });
}

export function useNotebookEntry(id: string) {
  return useQuery({
    queryKey: queryKeys.notebook.byId(id),
    queryFn: () => notebook.getById(id),
  });
}

export function useSaveNotebookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveNotebookBody) => notebook.save(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notebook.list() });
    },
  });
}

export function useUpdateNotebookNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => notebook.updateNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notebook.list() });
    },
  });
}

export function useDeleteNotebookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notebook.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notebook.list() });
    },
  });
}
