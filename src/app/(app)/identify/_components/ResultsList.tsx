"use client";

import Image from "next/image";
import type { IdentifyResult } from "@/lib/api";
import { ChevronRightIcon } from "@/components/icons";
import { ConfidenceBar } from "./ConfidenceBar";
import styles from "./ResultsList.module.scss";

export function ResultsList({
  results,
  onSelect,
}: {
  results: IdentifyResult[];
  onSelect: (r: IdentifyResult) => void;
}) {
  return (
    <div className={styles.results}>
      <h2 className={styles.title}>Top matches</h2>
      <p className={styles.subtitle}>Tap a result to see more details.</p>

      <div className={styles.list}>
        {results.map((result, i) => (
          <button
            key={i}
            className={styles.row}
            onClick={() => onSelect(result)}
          >
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
