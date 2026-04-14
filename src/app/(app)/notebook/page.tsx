"use client";

import { useQuery } from "@tanstack/react-query";
import { FindCard, NotebookStrip } from "@/components/ui";
import { notebook } from "@/lib/api";
import styles from "./page.module.scss";

export default function NotebookPage() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["notebook"],
    queryFn: notebook.list,
  });

  return (
    <div className={styles.page}>
      {/* ── Header ───────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notebook</h1>
          <p className={styles.subtitle}>Your personal field journal</p>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────── */}
      <div className={styles.strip}>
        <NotebookStrip count={entries.length} weekCount={0} />
      </div>

      {/* ── Entries grid ─────────────────────────── */}
      {isLoading ? (
        <div className={styles.empty}>
          <p className={styles.emptyHint}>Loading…</p>
        </div>
      ) : entries.length > 0 ? (
        <div className={styles.grid}>
          {entries.map((entry) => (
            <FindCard
              key={entry.id}
              name={entry.plantName}
              latin={entry.latinName}
              date={new Date(entry.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })}
              imageUrl={entry.imageUrl ?? "/images/plant-sequoia.avif"}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No plants yet</p>
          <p className={styles.emptyHint}>Identify a plant and save it to your notebook.</p>
        </div>
      )}
    </div>
  );
}
