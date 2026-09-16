import type { Location } from '../api/identify-api';

/**
 * The GPS position stored in the photo, rounded to two decimal places.
 *
 * The photo's own position is the right one, not the device's: a picture
 * chosen from the gallery was taken where the plant grows, not where the
 * person happens to be sitting now.
 *
 * Two decimals is roughly a kilometre. That is enough for the native or
 * invasive note, which is the only thing the API uses location for, without
 * sending the exact position of someone's garden.
 *
 * Must run BEFORE `prepareImage`, which re-encodes the photo and strips EXIF.
 * The parser is loaded on demand, so it costs nothing until a photo is picked.
 * Never throws: a photo with no GPS, or one the parser cannot read, simply has
 * no location.
 */
export async function readPhotoLocation(photo: Blob): Promise<Location | undefined> {
  try {
    // The mini build (28 kB instead of 74 kB) reads JPEG EXIF including GPS,
    // which covers every photo the app accepts: phones hand over JPEG.
    const { gps } = await import('exifr/dist/mini.esm.mjs');
    const position = await gps(photo);
    if (!position || !Number.isFinite(position.latitude) || !Number.isFinite(position.longitude)) {
      return undefined;
    }
    return { latitude: round2(position.latitude), longitude: round2(position.longitude) };
  } catch {
    return undefined;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
