import { ImagePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';

import styles from './PhotoDropZone.module.scss';

/** What the API accepts, because PlantNet accepts nothing else. */
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

interface PhotoDropZoneProps {
  onPhoto: (photo: File) => void;
  onReject: (message: string) => void;
  disabled?: boolean;
}

/**
 * Where a plant photo goes in.
 *
 * One real button that fills the zone, so it works by tap, click and keyboard
 * alike. Dragging is a desktop layer on that same button, not a separate path, which
 * matters because touch devices have no drag and drop for files at all.
 *
 * The file input deliberately has no `capture` attribute: that would force the
 * camera, while without it phones offer camera, photo library and files. And
 * because `accept` lists only JPEG and PNG, iOS converts a HEIC photo to JPEG
 * before handing it over.
 */
export function PhotoDropZone({ onPhoto, onReject, disabled = false }: PhotoDropZoneProps) {
  const { m } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // dragenter and dragleave fire for every child the pointer crosses, so a
  // plain boolean flickers as the file moves over the icon. A depth count only
  // reaches zero when the pointer has really left the zone.
  const depth = useRef(0);

  useEffect(() => {
    // A photo released just outside the zone would otherwise make the browser
    // navigate away to display it, discarding the page.
    const swallow = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
    };
    window.addEventListener('dragover', swallow);
    window.addEventListener('drop', swallow);
    return () => {
      window.removeEventListener('dragover', swallow);
      window.removeEventListener('drop', swallow);
    };
  }, []);

  function take(files: FileList | null | undefined) {
    const photo = files?.[0];
    if (!photo) return;
    // Checked here for drops: `accept` only filters the picker, and a drag can
    // carry any file at all.
    if (!ACCEPTED_PHOTO_TYPES.includes(photo.type)) {
      onReject(m.plants.wrongType);
      return;
    }
    onPhoto(photo);
  }

  const className = [styles.zone, dragging ? styles.dragging : '', disabled ? styles.disabled : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <button
        type="button"
        className={styles.target}
        onDragEnter={(event) => {
          if (disabled) return;
          event.preventDefault();
          depth.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        }}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          depth.current = 0;
          setDragging(false);
          if (!disabled) take(event.dataTransfer.files);
        }}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <span className={styles.icon} aria-hidden="true">
          <ImagePlus />
        </span>
        {/* Both wordings are in the markup; CSS shows one by pointer type. A
            hidden variant is display:none, so it is not read out either. */}
        <span className={styles.title}>
          <span className={styles.fine}>{dragging ? m.plants.dropActive : m.plants.dropTitle}</span>
          <span className={styles.coarse}>{m.plants.dropTitleTouch}</span>
        </span>
        <span className={styles.hint}>
          <span className={styles.fine}>{m.plants.dropHint}</span>
          <span className={styles.coarse}>{m.plants.dropHintTouch}</span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(',')}
        hidden
        onChange={(event) => {
          take(event.target.files);
          // Cleared so choosing the same photo again still fires a change.
          event.target.value = '';
        }}
      />
    </div>
  );
}
