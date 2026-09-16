import type { Messages } from '@/lib/i18n';

import type { Detection, PlantCandidate } from '../api/identify-api';

export interface PlantNames {
  /** What people actually call it, when the API knows one. */
  common: string | null;
  scientific: string;
  /** The candidate the names came from, for family, genus and confidence. */
  candidate: PlantCandidate | undefined;
}

/**
 * The names to show for a detection.
 *
 * A confirmed species is stored as its scientific name, so the common name has
 * to come back from the candidate that was confirmed. Falls back to the top
 * match for a detection nobody confirmed.
 */
export function plantNames(item: Detection, m: Messages): PlantNames {
  const candidate =
    item.candidates.find((option) => option.species === item.confirmedSpecies) ??
    item.candidates[0];
  const scientific = item.confirmedSpecies ?? candidate?.species ?? m.plants.unnamed;
  return { common: candidate?.commonNames[0] ?? null, scientific, candidate };
}

/** The name a card leads with: the common one where there is one. */
export function primaryName(item: Detection, m: Messages): string {
  const names = plantNames(item, m);
  return names.common ?? names.scientific;
}
