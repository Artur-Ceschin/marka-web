import { ImagePlus, ScanSearch } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';

import styles from './PhotoConfirm.module.scss';

const ACCEPTED = ['image/jpeg', 'image/png'];

interface PhotoConfirmProps {
  photo: File;
  onConfirm: () => void;
  onChoose: (photo: File) => void;
  onReject: (message: string) => void;
}

/**
 * A look at the photo before it is sent.
 *
 * Worth the extra tap here: an identification spends one of ten daily tries
 * and is charged even when nothing is found, so a blurry or distant shot
 * costs something real. The photo is only read locally at this point; nothing
 * is uploaded until this screen is confirmed.
 */
export function PhotoConfirm({ photo, onConfirm, onChoose, onReject }: PhotoConfirmProps) {
  const { m } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photo]);

  return (
    <section className={styles.panel} aria-labelledby="photo-confirm-title">
      <div className={styles.photo}>
        {preview ? <img src={preview} alt={m.plants.yourPhoto} /> : null}
      </div>

      <div>
        <h2 id="photo-confirm-title" className={styles.heading}>
          {m.plants.confirmTitle}
        </h2>
        <p className={styles.hint}>{m.plants.confirmHint}</p>
        {/* The cost is stated where the decision is made, not after it. */}
        <p className={styles.cost}>{m.plants.confirmCost}</p>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          className={styles.action}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus aria-hidden="true" />
          {m.plants.chooseAnother}
        </Button>
        <Button className={styles.action} onClick={onConfirm}>
          <ScanSearch aria-hidden="true" />
          {m.plants.usePhoto}
        </Button>
      </div>

      {/* No `capture`, so a phone still offers the camera and the library. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className={styles.file}
        aria-label={m.plants.chooseAnother}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          if (!ACCEPTED.includes(file.type)) {
            onReject(m.plants.wrongType);
            return;
          }
          onChoose(file);
        }}
      />
    </section>
  );
}
