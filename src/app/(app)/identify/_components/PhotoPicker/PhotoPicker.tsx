'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { IoCloudUploadOutline, IoCameraOutline, IoImagesOutline } from 'react-icons/io5';
import styles from './PhotoPicker.module.scss';

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

  const statusText = isIdentifying
    ? 'PROCESSING_SPECIMEN'
    : canIdentify
      ? 'SPECIMEN_LOADED'
      : 'AWAITING_SPECIMEN';

  return (
    <div className={styles.viewfinder}>
      {/* Hidden file inputs */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleInput}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.fileInput}
        onChange={handleInput}
      />

      {/* Preview image */}
      {preview && (
        <Image
          src={preview}
          alt="Selected plant"
          fill
          style={{ objectFit: 'cover' }}
          className={styles.previewImg}
        />
      )}

      {/* Bottom gradient */}
      <div className={styles.gradientOverlay} />

      {/* HUD metadata overlays */}
      <div className={styles.meta}>
        {/* Top row */}
        <div className={styles.metaTop}>
          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Status</span>
            <div className={styles.metaValue}>
              <span
                className={`${styles.statusDot} ${isIdentifying ? styles.statusDotProcessing : ''}`}
              />
              {statusText}
            </div>
          </div>
          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Archive_Ref</span>
            <div className={`${styles.metaValue} ${styles.metaValueRight}`}>MK-449.02-FIELD</div>
          </div>
        </div>

        {/* Bottom row */}
        <div className={styles.metaBottom}>
          <div className={styles.metaGrid}>
            <div className={styles.metaCell}>
              <span className={styles.metaCellLabel}>ISO</span>
              <span className={styles.metaCellValue}>400</span>
            </div>
            <div className={styles.metaCell}>
              <span className={styles.metaCellLabel}>Focus</span>
              <span className={styles.metaCellValue}>∞ INF</span>
            </div>
            <div className={styles.metaCell}>
              <span className={styles.metaCellLabel}>Mode</span>
              <span className={styles.metaCellValue}>AUTO</span>
            </div>
            <div className={styles.metaCell}>
              <span className={styles.metaCellLabel}>AI</span>
              <span className={styles.metaCellValue}>V3.1</span>
            </div>
          </div>

          {!isIdentifying && (
            <div className={styles.metaActions}>
              <button className={styles.metaBtn} onClick={() => cameraRef.current?.click()}>
                <IoCameraOutline size={13} />
                Take Photo
              </button>
              <button className={styles.metaBtn} onClick={() => galleryRef.current?.click()}>
                <IoImagesOutline size={13} />
                Library
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center reticle + action */}
      <div className={styles.center}>
        <div className={styles.reticle}>
          <span className={styles.cornerTL} />
          <span className={styles.cornerTR} />
          <span className={styles.cornerBL} />
          <span className={styles.cornerBR} />

          <div className={styles.uploadPrompt}>
            {isIdentifying ? (
              <>
                <div className={styles.spinner} />
                <span className={styles.scanHint}>Analyzing specimen…</span>
              </>
            ) : canIdentify ? (
              <>
                <button
                  className={`${styles.scanBtn} ${styles.scanBtnAnalyze}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onIdentify();
                  }}
                >
                  Identify Specimen
                </button>
                <button
                  className={styles.clearBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                >
                  Clear photo
                </button>
              </>
            ) : (
              <>
                <IoCloudUploadOutline size={40} className={styles.uploadIcon} />
                <button
                  className={styles.scanBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    galleryRef.current?.click();
                  }}
                >
                  Initiate Scan
                </button>
                <span className={styles.scanHint}>or drag-and-drop plate</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
