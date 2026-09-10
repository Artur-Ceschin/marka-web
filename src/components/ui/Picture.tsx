import type { AppImage } from '@/assets/images';

interface PictureProps {
  image: AppImage;
  /**
   * The `sizes` attribute: how wide the image renders at a given viewport.
   * Getting this right is what makes the srcset useful: the browser picks a
   * candidate *before* layout, so it cannot work this out on its own.
   */
  sizes: string;
  className?: string;
  /**
   * Set on the LCP image only. Loads eagerly at high priority; everything else
   * stays lazy.
   */
  priority?: boolean;
}

/**
 * Renders a responsive `<picture>` from a registry entry.
 *
 * Source order matters: the browser takes the first `<source>` it supports, so
 * AVIF must precede WebP. The `<img>` carries intrinsic width/height so the
 * box is reserved before the bytes arrive: this is the difference between a
 * CLS of 0 and a visible reflow.
 */
export function Picture({ image, sizes, className, priority = false }: PictureProps) {
  const { sources, img, alt } = image;

  return (
    <picture>
      {sources.avif ? <source type="image/avif" srcSet={sources.avif} sizes={sizes} /> : null}
      {sources.webp ? <source type="image/webp" srcSet={sources.webp} sizes={sizes} /> : null}
      <img
        src={img.src}
        width={img.w}
        height={img.h}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  );
}
