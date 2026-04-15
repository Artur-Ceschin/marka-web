"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FindCard } from "@/components/ui";
import { IoSearchOutline } from "react-icons/io5";
import { notebook } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import styles from "./page.module.scss";

type Filter = "all" | "month" | "notes";

export default function NotebookPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["notebook"],
    queryFn: notebook.list,
  });

  const filtered = useMemo(() => {
    let list = entries;

    if (filter === "month") {
      const now = new Date();
      list = list.filter((e) => {
        const d = new Date(e.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filter === "notes") {
      list = list.filter((e) => e.note && e.note.trim().length > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.plantName.toLowerCase().includes(q) || e.latinName.toLowerCase().includes(q),
      );
    }

    return list;
  }, [entries, filter, search]);

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "month", label: "This month" },
    { id: "notes", label: "With notes" },
  ];

  return (
    <div className={styles.page}>
      <PageHeader title="Notebook" subtitle="Your field journal" />

      <div className={styles.card}>
        <label className={styles.search}>
          <IoSearchOutline size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search plants, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`${styles.filterBtn} ${filter === f.id ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.empty}>
            <p className={styles.emptyHint}>Loading…</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((entry) => (
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
            <p className={styles.emptyTitle}>{search ? "No results" : "No plants yet"}</p>
            <p className={styles.emptyHint}>
              {search
                ? "Try a different search term."
                : "Identify a plant and save it to your notebook."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
