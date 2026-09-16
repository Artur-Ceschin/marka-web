/**
 * Longest edge sent for identification. PlantNet gains nothing past ~1500px,
 * and the enrichment model bills image tokens by dimensions, so anything
 * larger is slower to upload and costs more for no better answer.
 */
export const MAX_EDGE = 1536;
const JPEG_QUALITY = 0.85;

export function scaledSize(width: number, height: number, maxEdge = MAX_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Re-encodes a photo as a JPEG no larger than MAX_EDGE on its long side.
 *
 * The API accepts only JPEG and PNG, because PlantNet accepts nothing else, and caps
 * uploads at 10 MB, which phone photos routinely exceed. `imageOrientation`
 * applies the EXIF rotation so a portrait shot is not uploaded sideways.
 *
 * Re-encoding drops EXIF, including GPS. Read the photo's location before
 * calling this if you want it. HEIC decodes only where the browser can
 * (Safari); elsewhere this rejects and the UI should ask for a JPEG instead.
 */
export async function prepareImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  try {
    const { width, height } = scaledSize(bitmap.width, bitmap.height);
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable');
    }

    context.drawImage(bitmap, 0, 0, width, height);
    return await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY });
  } finally {
    bitmap.close();
  }
}
