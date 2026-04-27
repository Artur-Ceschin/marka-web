"use client";

import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui";
import { LeafOutlineIcon } from "@/components/icons";
import styles from "./PhotoPicker.module.scss";

export function PhotoPicker({
  preview,
  canIdentify,
  isIdentifying,
  onSelect,
  onIdentify,
  onClear,
}: {
  preview: string | null;
  canIdentify: boolean;
  isIdentifying: boolean;
  onSelect: (file: File) => void;
  onIdentify: () => void;
  onClear: () => void;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onSelect(f);
  }

  return (
    <>
      <div
        className={styles.photoArea}
        onClick={() => !preview && galleryRef.current?.click()}
      >
        {preview ? (
          <Image src={preview} alt="Selected plant" fill style={{ objectFit: "cover" }} />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <LeafOutlineIcon />
            </div>
            <p className={styles.emptyTitle}>No photo yet</p>
            <p className={styles.emptyHint}>Use the camera or pick one from your gallery.</p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleInput}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleInput}
        />

        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={() => cameraRef.current?.click()}
        >
          Take photo
        </Button>

        <Button
          variant="secondary"
          size="xl"
          fullWidth
          onClick={() => galleryRef.current?.click()}
        >
          Choose from gallery
        </Button>

        {canIdentify && (
          <>
            <button className={styles.clearBtn} onClick={onClear}>
              Clear photo
            </button>
            <Button
              variant="primary"
              size="xl"
              fullWidth
              loading={isIdentifying}
              onClick={onIdentify}
            >
              Identify this plant
            </Button>
          </>
        )}
      </div>

      <div className={styles.tip}>
        For best results, capture a clear shot of the leaves or flowers against a simple
        background.
      </div>
    </>
  );
}
