// AVIF and WebP are imported separately so each gets its own quality. AVIF
// holds up far better at low quality, and one shared setting either bloats
// the AVIF (which ~95% of visitors get) or softens the WebP fallback.
// 1920px is the widest variant: the full-bleed bands never need more at the
// 100vw size they are shown, and 2400px files cost 250 to 600 kB each.
import flowerAvif from './flower.jpg?w=560;840;1120&format=avif&quality=50&as=picture';
import flowerWebp from './flower.jpg?w=560;840;1120&format=webp&quality=72&as=picture';
import forestAvif from './forest.jpg?w=560;840;1120;1440&format=avif&quality=50&as=picture';
import forestWebp from './forest.jpg?w=560;840;1120;1440&format=webp&quality=72&as=picture';
import forestTropicalAvif from './forest-tropical.jpg?w=800;1280;1920&format=avif&quality=50&as=picture';
import forestTropicalWebp from './forest-tropical.jpg?w=800;1280;1920&format=webp&quality=72&as=picture';
import lupineAvif from './lupine-flower.jpg?w=800;1280;1920&format=avif&quality=50&as=picture';
import lupineWebp from './lupine-flower.jpg?w=800;1280;1920&format=webp&quality=72&as=picture';
import mountainAvif from './moutain.jpg?w=800;1280;1920&format=avif&quality=50&as=picture';
import mountainWebp from './moutain.jpg?w=800;1280;1920&format=webp&quality=72&as=picture';
import mushroomsAvif from './mushrooms.jpg?w=560;840;1120&format=avif&quality=50&as=picture';
import mushroomsWebp from './mushrooms.jpg?w=560;840;1120&format=webp&quality=72&as=picture';
import treeFruitAvif from './tree-fruit.jpg?w=560;840;1120&format=avif&quality=50&as=picture';
import treeFruitWebp from './tree-fruit.jpg?w=560;840;1120&format=webp&quality=72&as=picture';

export interface AppImage {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
  alt: string;
}

type GeneratedPicture = {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
};

/** One picture from the two per-format imports; the WebP is the <img> fallback. */
const withAlt = (avif: GeneratedPicture, webp: GeneratedPicture, alt: string): AppImage => ({
  sources: { ...avif.sources, ...webp.sources },
  img: webp.img,
  alt,
});

export const images = {
  mountain: withAlt(
    mountainAvif,
    mountainWebp,
    'A glacial lake winding between forested mountain ridges under a clouded sky.',
  ),
  forestTropical: withAlt(
    forestTropicalAvif,
    forestTropicalWebp,
    'Shafts of morning sunlight breaking through the canopy of a misty tropical forest.',
  ),
  flower: withAlt(
    flowerAvif,
    flowerWebp,
    'A wild geranium in sharp focus, its five violet petals veined with darker lines, against a meadow of blurred blooms.',
  ),
  mushrooms: withAlt(
    mushroomsAvif,
    mushroomsWebp,
    'A cluster of tan-capped mushrooms growing in tiers from the mossy bark of a decaying tree trunk.',
  ),
  treeFruit: withAlt(
    treeFruitAvif,
    treeFruitWebp,
    'Ripe oranges hanging among dark green leaves on a citrus branch at dusk.',
  ),
  forest: withAlt(
    forestAvif,
    forestWebp,
    'Looking straight up into a beech canopy, sunlight scattering through bright green leaves.',
  ),
  lupine: withAlt(
    lupineAvif,
    lupineWebp,
    'A single purple lupine spike standing above its palmate leaves in a green meadow.',
  ),
} satisfies Record<string, AppImage>;
