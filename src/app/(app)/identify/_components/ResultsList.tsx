"use client";

import Image from "next/image";
import type { IdentifyResult } from "@/lib/api";
import { ChevronRightIcon } from "@/components/icons";
import { ConfidenceBar } from "./ConfidenceBar";
import styles from "./ResultsList.module.scss";

export function ResultsList({
  results,
  onSelect,
  onBack,
}: {
  results: IdentifyResult[];
  onSelect: (r: IdentifyResult) => void;
  onBack: () => void;
}) {
  return (
    <div className={styles.results}>
      <div className={styles.resultsHeader}>
        <div>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            <span className={styles.eyebrowLabel}>Analysis Complete</span>
          </div>
          <h2 className={styles.title}>Top Matches</h2>
          <p className={styles.subtitle}>Select a specimen to view the full field report.</p>
        </div>
        <button className={styles.backBtn} onClick={onBack}>
          New scan
        </button>
      </div>

      <div className={styles.list}>
        {results.map((result, i) => (
          <button key={i} className={styles.row} onClick={() => onSelect(result)}>
            {result.imageUrl && (
              <div className={styles.thumb}>
                <Image
                  src={result.imageUrl}
                  alt={result.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <div className={styles.info}>
              <span className={styles.rank}>#{i + 1}</span>
              <span className={styles.name}>{result.name}</span>
              <span className={styles.latin}>{result.latin}</span>
              <ConfidenceBar pct={Math.round(result.confidence * 100)} />
            </div>
            <ChevronRightIcon />
          </button>
        ))}
      </div>
    </div>
  );
}
