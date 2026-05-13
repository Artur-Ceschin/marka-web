'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { IoCloseOutline, IoLeafOutline, IoWarningOutline } from 'react-icons/io5';
import { plants, type NearbyPlant } from '@/lib/api';
import styles from './PlantDetailPanel.module.scss';

interface Props {
  latin: string | null;
  fallback: NearbyPlant | null;
  onClose: () => void;
}

export function PlantDetailPanel({ latin, fallback, onClose }: Props) {
  const open = !!latin;

  const {
    data: plant,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['plant', latin],
    queryFn: () => plants.getByLatin(latin!),
    enabled: !!latin,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`} onClick={onClose}>
      <aside
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <IoCloseOutline size={22} />
        </button>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
              <div className={styles.skeletonLine} style={{ width: '80%', marginTop: 16 }} />
              <div className={styles.skeletonLine} style={{ width: '70%' }} />
            </div>
          </div>
        )}

        {/* Full catalog data */}
        {plant && (
          <>
            <div className={styles.hero}>
              {plant.imageUrl ? (
                <Image
                  src={plant.imageUrl}
                  alt={plant.commonName}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className={styles.heroImg}
                  priority
                />
              ) : (
                <span className={styles.heroFallback}>
                  <IoLeafOutline size={48} />
                </span>
              )}
            </div>

            <div className={styles.body}>
              <div className={styles.badges}>
                <span className={styles.badgeFamily}>{plant.family}</span>
                {plant.isInvasive && (
                  <span className={styles.badgeInvasive}>
                    <IoWarningOutline size={10} /> Invasive
                  </span>
                )}
              </div>

              <h2 className={styles.commonName}>{plant.commonName}</h2>
              <p className={styles.latinName}>{plant.latinName}</p>
              {plant.scientificNameAuthorship && (
                <p className={styles.authorship}>{plant.scientificNameAuthorship}</p>
              )}

              {plant.description && <p className={styles.description}>{plant.description}</p>}

              {plant.tags && plant.tags.length > 0 && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Characteristics</p>
                  <div className={styles.tagList}>
                    {plant.tags.map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {plant.nativeRegions && plant.nativeRegions.length > 0 && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Native regions</p>
                  <div className={styles.tagList}>
                    {plant.nativeRegions.map((r) => (
                      <span key={r} className={styles.tagRegion}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {plant.referenceImages && plant.referenceImages.length > 0 && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Reference photos</p>
                  <div className={styles.refGrid}>
                    {plant.referenceImages.slice(0, 6).map((img, i) => (
                      <div key={i} className={styles.refWrap}>
                        <Image
                          src={img.url}
                          alt={img.organ}
                          fill
                          sizes="100px"
                          className={styles.refImg}
                        />
                        <span className={styles.refOrgan}>{img.organ}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Fallback when catalog lookup fails (404 / not in catalog yet) */}
        {isError && fallback && (
          <>
            <div className={styles.hero}>
              {fallback.imageUrl ? (
                <Image
                  src={fallback.imageUrl}
                  alt={fallback.common}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className={styles.heroImg}
                  priority
                />
              ) : (
                <span className={styles.heroFallback}>
                  <IoLeafOutline size={48} />
                </span>
              )}
            </div>

            <div className={styles.body}>
              <div className={styles.badges}>
                <span className={styles.badgeFamily}>{fallback.family}</span>
                {fallback.biomes?.map((b) => (
                  <span key={b} className={styles.badgeBiome}>
                    {b}
                  </span>
                ))}
              </div>

              <h2 className={styles.commonName}>{fallback.common}</h2>
              <p className={styles.latinName}>{fallback.latin}</p>

              <div className={styles.sightingsRow}>
                <span className={styles.sightingsNum}>{fallback.occurrenceCount}</span>
                <span className={styles.sightingsLbl}>sightings nearby</span>
              </div>

              <p className={styles.notInCatalog}>
                Full plant profile not yet available in our catalog.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}
