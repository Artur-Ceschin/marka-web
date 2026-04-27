"use client";

import Image from "next/image";
import type { NotebookEntry } from "@/lib/api";
import styles from "./NotebookCard.module.scss";

export function NotebookCard({
  entry,
  onClick,
}: {
  entry: NotebookEntry;
  onClick?: (entry: NotebookEntry) => void;
}) {
  const date = new Date(entry.identifiedAt);
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  const scorePct = Math.round(entry.confidence * 100);
  const imageUrl = entry.imageUrl || "/images/plant-sequoia.avif";

  const isHighConfidence = scorePct >= 80;

  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick ? () => onClick(entry) : undefined}
    >
      <div className={styles.media}>
        <Image
          src={imageUrl}
          alt={entry.plantName}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
        {isHighConfidence && (
          <span className={styles.rareBadge}>High Match</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{entry.plantName}</h3>
          <span className={styles.time}>{timeStr}</span>
        </div>

        <p className={styles.latin}>{entry.latinName}</p>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Date</span>
            <span className={styles.metaValue}>{dateStr}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Confidence</span>
            <span className={styles.metaValue}>{scorePct}%</span>
          </div>
          {entry.location?.place && (
            <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
              <span className={styles.metaLabel}>Location</span>
              <span className={styles.metaValue}>{entry.location.place}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
