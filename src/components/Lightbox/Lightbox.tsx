'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { CloseIcon } from '@/components/icons';
import styles from './Lightbox.module.scss';

export type LightboxItem = { url: string; caption?: string };

export function Lightbox({ item, onClose }: { item: LightboxItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={onClose}>
      <button
        type="button"
        className={styles.close}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        <CloseIcon />
      </button>
      <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
        <Image
          src={item.url}
          alt={item.caption ?? 'Photo'}
          fill
          style={{ objectFit: 'contain' }}
          sizes="100vw"
        />
      </div>
      {item.caption && <p className={styles.caption}>{item.caption}</p>}
    </div>
  );
}
