'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { IoSearchOutline } from 'react-icons/io5';
import { notebook } from '@/lib/api';
import { NotebookCard } from './_components/NotebookCard';
import styles from './page.module.scss';

type Filter = 'all' | 'month' | 'notes';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All Entries' },
  { id: 'month', label: 'This Month' },
  { id: 'notes', label: 'With Notes' },
];

export default function NotebookPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['notebook'],
    queryFn: () => notebook.list().then((r) => r.items),
  });

  const filtered = useMemo(() => {
    let list = entries;

    if (filter === 'month') {
      const now = new Date();
      list = list.filter((e) => {
        const d = new Date(e.identifiedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filter === 'notes') {
      list = list.filter((e) => e.notes && e.notes.trim().length > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.plantName.toLowerCase().includes(q) || e.latinName.toLowerCase().includes(q),
      );
    }

    return list;
  }, [entries, filter, search]);

  return (
    <div className={styles.page}>
      {/* Editorial header */}
      <header className={styles.header}>
        <div className={styles.headerEyebrow}>
          <span className={styles.headerLine} />
          <span className={styles.headerLabel}>Your Field Journal</span>
        </div>
        <h1 className={styles.headerTitle}>
          Field Observations
          <span className={styles.headerTitleItalic}>The Plant Archive</span>
        </h1>
        <p className={styles.headerSubtitle}>
          A personal chronicle of flora identified and documented in the field.
        </p>
      </header>

      <div className={styles.content}>
        {/* Search */}
        <label className={styles.search}>
          <IoSearchOutline size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search archive…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {/* Filters */}
        <div className={styles.filtersRow}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`${styles.filterBtn} ${filter === f.id ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className={styles.empty}>
            <p className={styles.emptyHint}>Loading…</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((entry) => (
              <NotebookCard
                key={entry.id}
                entry={entry}
                onClick={(e) => router.push(`/notebook/${e.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{search ? 'No results' : 'No plants yet'}</p>
            <p className={styles.emptyHint}>
              {search
                ? 'Try a different search term.'
                : 'Identify a plant and save it to your notebook.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
