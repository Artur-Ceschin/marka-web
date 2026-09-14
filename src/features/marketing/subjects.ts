import { type AppImage, images } from '@/assets/images';
import type { Messages } from '@/lib/i18n';

/**
 * The three subjects Marka identifies.
 *
 * A function of the message tree rather than a constant, so the copy follows
 * the active locale while the ids, order and images stay fixed. The ids are
 * shared between the hero's jump links and the cards they scroll to, so a
 * broken `#fungi` link cannot happen: a broken jump link fails silently in the
 * browser, which is the kind of bug nobody notices for months.
 *
 * Marka identifies all three the same way. What differs is how much certainty
 * it can honestly offer, which is what `caveat` records, not a claim of
 * specialisation in any one of them.
 */
export interface Subject {
  id: 'flowers' | 'fungi' | 'trees';
  label: string;
  headline: string;
  text: string;
  image: AppImage;
  caveat: string;
}

export function getSubjects(m: Messages): Subject[] {
  return [
    { id: 'flowers', image: images.flower, ...m.subjects.flowers },
    { id: 'fungi', image: images.mushrooms, ...m.subjects.fungi },
    { id: 'trees', image: images.treeFruit, ...m.subjects.trees },
  ];
}
