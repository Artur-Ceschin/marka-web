/**
 * Image registry.
 *
 * Every photograph in the app is declared here once, with the widths it will
 * actually be displayed at and its alt text. Two reasons this is centralised:
 *
 * 1. `vite-imagetools` query strings must be static string literals: they are
 *    resolved at build time, so they cannot be built dynamically at the call
 *    site anyway.
 * 2. Alt text is content, not markup. Keeping it beside the file means a photo
 *    can never be used somewhere without one.
 *
 * Quality is deliberately left at the per-format defaults (AVIF 50, WebP 80).
 * imagetools exposes only ONE `quality` directive, applied to every format in
 * the import, so raising it to suit WebP also inflates AVIF, which is the
 * format nearly every visitor actually receives. Measured on forest.jpg at
 * 1120px: AVIF q50 = 329 KB, q70 = 616 KB for no visible gain. If the WebP
 * fallback ever needs tuning, split it into its own import rather than
 * changing this one.
 *
 * Width sets are chosen per usage. A full-bleed hero needs up to 2400px; a card
 * in a three-column grid never renders above ~960px even on a 2x display, and
 * generating more is wasted build time and wasted bytes.
 */

import flowerImg from './flower.jpg?w=560;840;1120&format=avif;webp&as=picture';
import forestImg from './forest.jpg?w=560;840;1120&format=avif;webp&as=picture';
import forestTropicalImg from './forest-tropical.jpg?w=800;1280;1920;2400&format=avif;webp&as=picture';
import lupineImg from './lupine-flower.jpg?w=800;1280;1920&format=avif;webp&as=picture';
import mountainImg from './moutain.jpg?w=800;1280;1920;2400&format=avif;webp&as=picture';
import mushroomsImg from './mushrooms.jpg?w=560;840;1120&format=avif;webp&as=picture';
import treeFruitImg from './tree-fruit.jpg?w=560;840;1120&format=avif;webp&as=picture';

export interface AppImage {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
  alt: string;
}

const withAlt = (
  asset: { sources: Record<string, string>; img: { src: string; w: number; h: number } },
  alt: string,
): AppImage => ({ ...asset, alt });

export const images = {
  mountain: withAlt(
    mountainImg,
    'A glacial lake winding between forested mountain ridges under a clouded sky.',
  ),
  forestTropical: withAlt(
    forestTropicalImg,
    'Shafts of morning sunlight breaking through the canopy of a misty tropical forest.',
  ),
  flower: withAlt(
    flowerImg,
    'A wild geranium in sharp focus, its five violet petals veined with darker lines, against a meadow of blurred blooms.',
  ),
  mushrooms: withAlt(
    mushroomsImg,
    'A cluster of tan-capped mushrooms growing in tiers from the mossy bark of a decaying tree trunk.',
  ),
  treeFruit: withAlt(
    treeFruitImg,
    'Ripe oranges hanging among dark green leaves on a citrus branch at dusk.',
  ),
  forest: withAlt(
    forestImg,
    'Looking straight up into a beech canopy, sunlight scattering through bright green leaves.',
  ),
  lupine: withAlt(
    lupineImg,
    'A single purple lupine spike standing above its palmate leaves in a green meadow.',
  ),
} satisfies Record<string, AppImage>;
