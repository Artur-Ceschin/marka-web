import { Pencil, Trash2 } from 'lucide-react';
import { type ReactNode, useMemo, useRef } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/Button';

import type { Detection } from '../api/identify-api';
import { useIdentifications } from '../api/queries';
import { usePlantDialogs } from '../components/usePlantDialogs';
import { plantNames } from '../lib/plant-names';

import styles from './PlantJournalPage.module.scss';

/** When the plant was seen if that is known, otherwise when it was identified. */
function entryDate(item: Detection): Date {
  const date = new Date(item.observedAt ?? item.createdAt);
  return Number.isNaN(date.getTime()) ? new Date(item.createdAt) : date;
}

interface Month {
  key: string;
  label: string;
  entries: { item: Detection; date: Date }[];
}

/**
 * The journal: every identification as a dated entry, newest first.
 *
 * The catalogue answers "what do I have"; this answers "what did I find, and
 * when". Same data, same query and same cache, so opening it costs no request.
 */
export function PlantJournalPage() {
  const { m, locale } = useI18n();
  const query = useIdentifications();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const dialogs = usePlantDialogs(items, () => {
    // The row that opened the dialog went with the deleted plant, so focus
    // would otherwise fall back to the top of the document.
    setTimeout(() => headingRef.current?.focus(), 0);
  });

  const monthFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale],
  );
  const dayFormat = useMemo(() => new Intl.DateTimeFormat(locale, { day: 'numeric' }), [locale]);
  const weekdayFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale],
  );

  // Grouped in the order the API sent them, which is newest first.
  const months = useMemo(() => {
    const grouped: Month[] = [];
    for (const item of items) {
      const date = entryDate(item);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const last = grouped.at(-1);
      if (last?.key === key) last.entries.push({ item, date });
      else grouped.push({ key, label: monthFormat.format(date), entries: [{ item, date }] });
    }
    return grouped;
  }, [items, monthFormat]);

  let body: ReactNode;
  if (query.isPending) {
    body = (
      <p className={styles.status} role="status">
        {m.common.loading}
      </p>
    );
  } else if (query.isError) {
    body = (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{m.plants.listFailed}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            void query.refetch();
          }}
        >
          {m.plants.tryAgain}
        </Button>
      </div>
    );
  } else if (items.length === 0) {
    body = (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{m.journal.emptyTitle}</p>
        <p className={styles.emptyHint}>{m.journal.emptyHint}</p>
      </div>
    );
  } else {
    body = (
      <>
        {months.map((month) => (
          <section key={month.key} className={styles.month}>
            <div className={styles.monthHead}>
              <h2 className={styles.monthTitle}>{month.label}</h2>
              <span className={styles.monthCount}>
                {m.journal.entryCount(month.entries.length)}
              </span>
            </div>

            <ol className={styles.entries}>
              {month.entries.map(({ item, date }) => {
                const names = plantNames(item, m);
                const title = names.common ?? names.scientific;
                return (
                  <li key={item.detectionId} className={styles.entry}>
                    <div className={styles.when} aria-hidden="true">
                      <span className={styles.day}>{dayFormat.format(date)}</span>
                      <span className={styles.weekday}>{weekdayFormat.format(date)}</span>
                    </div>

                    <article className={styles.card}>
                      {/* The photo opens the same record as the name. Kept
                          out of the tab order and hidden from screen readers
                          on purpose: it duplicates the name button beside it,
                          and two stops for one action is noise. */}
                      <button
                        type="button"
                        className={styles.photoButton}
                        tabIndex={-1}
                        aria-hidden="true"
                        onClick={() => {
                          dialogs.view(item);
                        }}
                      >
                        <img
                          className={styles.photo}
                          src={item.thumbnailUrl ?? item.imageUrl}
                          alt=""
                          width={160}
                          height={160}
                          loading="lazy"
                          decoding="async"
                        />
                      </button>

                      <div className={styles.text}>
                        {/* The name is the control that opens the record: one
                            clear target with a real name, instead of a click
                            handler on the whole row. */}
                        <h3 className={styles.name}>
                          <button
                            type="button"
                            className={styles.open}
                            onClick={() => {
                              dialogs.view(item);
                            }}
                          >
                            {title}
                          </button>
                        </h3>
                        {names.common ? (
                          <p className={styles.scientific}>{names.scientific}</p>
                        ) : null}
                        <p className={styles.meta}>
                          {item.confirmedSpecies ? null : (
                            <span className={styles.badge}>{m.plants.notConfirmed}</span>
                          )}
                          <time dateTime={(item.observedAt ?? item.createdAt).slice(0, 10)}>
                            {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)}
                          </time>
                        </p>
                        {item.notes ? <p className={styles.notes}>{item.notes}</p> : null}
                      </div>

                      <div className={styles.tools}>
                        <button
                          type="button"
                          className={styles.tool}
                          aria-label={m.plants.editPlant(title)}
                          onClick={() => {
                            dialogs.edit(item);
                          }}
                        >
                          <Pencil aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={[styles.tool, styles.toolDanger].join(' ')}
                          aria-label={m.plants.deletePlant(title)}
                          onClick={() => {
                            dialogs.remove(item);
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        {query.hasNextPage ? (
          <div className={styles.more}>
            <Button
              variant="secondary"
              loading={query.isFetchingNextPage}
              onClick={() => {
                void query.fetchNextPage();
              }}
            >
              {query.isFetchingNextPage ? m.plants.loadingMore : m.plants.loadMore}
            </Button>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className={styles.page}>
      <AppBar />
      <main id="main" className={styles.main}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
          {m.journal.title}
        </h1>
        <p className={styles.subtitle}>{m.journal.subtitle}</p>
        {body}
      </main>
      {dialogs.element}
    </div>
  );
}
