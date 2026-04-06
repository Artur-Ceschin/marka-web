"use client";

import styles from "./Marquee.module.scss";

const PLANTS = [
  "Araucaria angustifolia", "Lagenaria siceraria", "Dryopteris filix‑mas",
  "Rosa canina", "Cantharellus cibarius", "Atropa belladonna",
  "Taraxacum officinale", "Sambucus nigra", "Urtica dioica",
  "Quercus robur", "Betula pendula", "Acer palmatum",
];

export function Marquee() {
  const items = [...PLANTS, ...PLANTS];
  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.inner}>
        {items.map((name, i) => (
          <span key={i} className={styles.item}>
            <em>{name}</em>
            <span className={styles.dot}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
