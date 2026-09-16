import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { API_ERROR_CODES, ApiError } from '@/lib/api-error';

import {
  confirmDetection,
  type Enrichment,
  type IdentifyResponse,
  type IdentifyStage,
  identifyPhoto,
} from '../api/identify-api';
import { plantKeys } from '../api/queries';
import { readPhotoLocation } from '../lib/read-location';

export type IdentifyFlowState =
  | { phase: 'idle' }
  | { phase: 'working'; stage: IdentifyStage; previewUrl: string | undefined }
  | { phase: 'results'; result: IdentifyResponse; previewUrl: string | undefined }
  | {
      phase: 'confirmed';
      species: string;
      /** Null when the enrichment model refused or the detection was already confirmed. */
      enrichment: Enrichment | null;
      already: boolean;
      previewUrl: string | undefined;
    }
  | { phase: 'error'; error: unknown; previewUrl: string | undefined };

// jsdom and some older browsers lack object URLs; the preview is optional.
function createPreview(photo: Blob): string | undefined {
  return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(photo) : undefined;
}

function revokePreview(url: string | undefined): void {
  if (url && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
}

/**
 * The identify flow as one state machine: photo in, progress, matches, a
 * confirmed species with its care details, or an error.
 */
export function useIdentifyFlow() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<IdentifyFlowState>({ phase: 'idle' });
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<unknown>(null);
  const photoRef = useRef<Blob | null>(null);
  // Object URLs hold the whole photo in memory until revoked.
  const previewRef = useRef<string | undefined>(undefined);

  useEffect(
    () => () => {
      revokePreview(previewRef.current);
    },
    [],
  );

  // Every attempt spends a credit and may create a detection, and every
  // confirmation changes one, so the catalogue is stale after either.
  const refreshCatalogue = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: plantKeys.identifications() });
  }, [queryClient]);

  const start = useCallback(
    async (photo: Blob) => {
      revokePreview(previewRef.current);
      const previewUrl = createPreview(photo);
      previewRef.current = previewUrl;
      photoRef.current = photo;
      setConfirmError(null);
      setState({ phase: 'working', stage: 'preparing', previewUrl });

      // Read first: preparing the image re-encodes it and strips the GPS.
      const location = await readPhotoLocation(photo);
      try {
        const result = await identifyPhoto(photo, location, (stage) => {
          setState({ phase: 'working', stage, previewUrl });
        });
        setState({ phase: 'results', result, previewUrl });
      } catch (error) {
        setState({ phase: 'error', error, previewUrl });
      } finally {
        refreshCatalogue();
      }
    },
    [refreshCatalogue],
  );

  const confirm = useCallback(
    async (species: string) => {
      if (state.phase !== 'results') return;
      const { result, previewUrl } = state;
      setConfirming(species);
      setConfirmError(null);
      try {
        const confirmed = await confirmDetection(result.identificationToken, species);
        setState({
          phase: 'confirmed',
          species: confirmed.confirmedSpecies ?? species,
          // Absent when the model declined: the species is saved regardless.
          enrichment: confirmed.enrichment ?? null,
          already: false,
          previewUrl,
        });
      } catch (error) {
        if (error instanceof ApiError && error.code === API_ERROR_CODES.alreadyConfirmed) {
          // The stored species may differ from the one just tapped, so it is not
          // shown; the refreshed catalogue has the real one.
          setState({ phase: 'confirmed', species, enrichment: null, already: true, previewUrl });
        } else {
          setConfirmError(error);
        }
      } finally {
        setConfirming(null);
        refreshCatalogue();
      }
    },
    [state, refreshCatalogue],
  );

  const retry = useCallback(async () => {
    if (photoRef.current) await start(photoRef.current);
  }, [start]);

  const reset = useCallback(() => {
    revokePreview(previewRef.current);
    previewRef.current = undefined;
    photoRef.current = null;
    setConfirmError(null);
    setState({ phase: 'idle' });
  }, []);

  return { state, start, confirm, confirming, confirmError, retry, reset };
}

export type IdentifyFlow = ReturnType<typeof useIdentifyFlow>;
