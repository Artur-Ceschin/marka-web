/** The stored size of a profile picture. Shown at 96px at most, so 512 covers
 * a retina screen with room to spare. */
const AVATAR_SIZE = 512;

/**
 * A square, centre-cropped JPEG of the chosen photo.
 *
 * Cropped here rather than by CSS in a circle: the stored file is then the
 * picture people chose, small enough to send over a phone connection, and it
 * carries no EXIF (including where the photo was taken) because the canvas
 * re-encodes only the pixels.
 */
export async function prepareAvatar(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const size = Math.min(side, AVATAR_SIZE);
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');

    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );
    return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  } finally {
    bitmap.close();
  }
}
