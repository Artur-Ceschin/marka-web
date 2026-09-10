import { type AppImage, images } from '@/assets/images';

/**
 * The three subjects Marka identifies.
 *
 * Shared between the hero's jump links and the cards they scroll to, so an id
 * can never drift out of sync with its anchor, a broken `#fungi` link would
 * fail silently, which is exactly the kind of bug nobody notices for months.
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

export const SUBJECTS: Subject[] = [
  {
    id: 'flowers',
    label: 'Flowers',
    headline: 'Wildflowers and garden blooms',
    text: 'Ranked matches with the traits behind each one: petal count, leaf arrangement, and where you were standing when you took the photo.',
    image: images.flower,
    caveat: 'Every match carries its confidence. Never a single silent guess.',
  },
  {
    id: 'fungi',
    label: 'Fungi',
    headline: 'Mushrooms and bracket fungi',
    text: 'Identified like everything else, and told plainly when a match is not strong enough to rely on. With fungi, that is often the honest answer.',
    image: images.mushrooms,
    caveat:
      'Never forage on an identification alone. Marka is a catalogue, not an authority on what is safe to eat.',
  },
  {
    id: 'trees',
    label: 'Trees',
    headline: 'Trees, shrubs and their fruit',
    text: 'Checked against conservation status as you record them, so you find out when something growing near you is threatened.',
    image: images.treeFruit,
    caveat: 'Conservation status sourced from the IUCN Red List.',
  },
];
