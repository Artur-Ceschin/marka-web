"use client";

import Image from "next/image";
import { IoLeafOutline } from "react-icons/io5";
import type { NearbyPlant } from "@/lib/api";
import styles from "./NearbyCard.module.scss";

interface Props {
  plant: NearbyPlant;
  onClick?: (plant: NearbyPlant) => void;
}

export function NearbyCard({ plant, onClick }: Props) {
  return (
    <article
      className={styles.card}
      onClick={() => onClick?.(plant)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(plant)}
    >
      <div className={styles.imageWrap}>
        {plant.imageUrl ? (
          <Image
            src={plant.imageUrl}
            alt={plant.common}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className={styles.image}
          />
        ) : (
          <span className={styles.imageFallback}>
            <IoLeafOutline size={36} />
          </span>
        )}

        <div className={styles.countBadge}>
          <span className={styles.countNum}>{plant.occurrenceCount}</span>
          <span className={styles.countLbl}>sightings</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.tags}>
          <span className={styles.family}>{plant.family}</span>
          {plant.biomes?.map((b) => (
            <span key={b} className={styles.biome}>
              {b}
            </span>
          ))}
        </div>
        <p className={styles.common}>{plant.common}</p>
        <p className={styles.latin}>{plant.latin}</p>
      </div>
    </article>
  );
}
