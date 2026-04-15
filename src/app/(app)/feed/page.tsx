"use client";

import styles from "./page.module.scss";

export default function FeedPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Feed</h1>
          <p className={styles.subtitle}>What&apos;s sprouting in the wild</p>
        </div>
      </div>

      <div className={styles.mapPlaceholder}>
        <p className={styles.mapComingSoon}>Feed coming soon</p>
      </div>
    </div>
  );
}
