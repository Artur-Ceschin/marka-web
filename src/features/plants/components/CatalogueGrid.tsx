import { Pencil, Trash2 } from 'lucide-react';
import { type ReactNode, useId, useMemo, useRef, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import type { Messages } from '@/lib/i18n';

import type { Detection } from '../api/identify-api';
import { useIdentifications } from '../api/queries';

import styles from './CatalogueGrid.module.scss';
import { DeleteDetectionDialog } from './DeleteDetectionDialog';
import { EditDetectionDialog } from './EditDetectionDialog';

/** An unconfirmed detection shows its best guess, marked as such on the card. */
function plantName(item: Detection, m: Messages): string {
  return item.confirmedSpecies ?? item.candidates[0]?.species ?? m.plants.unnamed;
}

/** Every identification, newest first: two columns on a phone, more as it widens. */
export function CatalogueGrid() {
  const { m, locale } = useI18n();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const query = useIdentifications();
  const [editing, setEditing] = useState<Detection | null>(null);
  const [deleting, setDeleting] = useState<Detection | null>(null);
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
    [locale],
  );
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
  };

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
        <p className={styles.emptyTitle}>{m.plants.emptyTitle}</p>
        <p className={styles.emptyHint}>{m.plants.emptyHint}</p>
      </div>
    );
  } else {
    body = (
      <>
        <ul className={styles.grid}>
          {items.map((item) => {
            const name = plantName(item, m);
            // When it was seen, if they said; otherwise when it was identified.
            const seen = item.observedAt ? formatDate(item.observedAt) : null;
            const created = formatDate(item.createdAt);
            return (
              <li key={item.detectionId} className={styles.card}>
                <div className={styles.media}>
                  <img
                    src={item.imageUrl}
                    alt={name}
                    width={400}
                    height={400}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={styles.tools}>
                    {/* Icon-only, so each carries a name that includes the plant:
                        a list of twenty identical "Edit" buttons is useless
                        to a screen reader. */}
                    <button
                      type="button"
                      className={styles.tool}
                      aria-label={m.plants.editPlant(name)}
                      onClick={() => {
                        setEditing(item);
                      }}
                    >
                      <Pencil aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={[styles.tool, styles.toolDanger].join(' ')}
                      aria-label={m.plants.deletePlant(name)}
                      onClick={() => {
                        setDeleting(item);
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p className={styles.name} title={name}>
                  {name}
                </p>
                <p className={styles.meta}>
                  {item.confirmedSpecies ? null : (
                    <span className={styles.badge}>{m.plants.notConfirmed}</span>
                  )}
                  {seen && item.observedAt ? (
                    <time dateTime={item.observedAt}>{m.plants.seenOn(seen)}</time>
                  ) : created ? (
                    <time dateTime={item.createdAt}>{created}</time>
                  ) : null}
                </p>
                {item.notes ? <p className={styles.notes}>{item.notes}</p> : null}
              </li>
            );
          })}
        </ul>
        {/* A button rather than infinite scroll: it is reachable by keyboard,
            announces itself, and never loads pages nobody asked for. */}
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
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className={styles.heading}>
        {m.plants.catalogueTitle}
      </h2>
      {body}

      {editing ? (
        <EditDetectionDialog
          detection={editing}
          name={plantName(editing, m)}
          onClose={() => {
            setEditing(null);
          }}
        />
      ) : null}
      {deleting ? (
        <DeleteDetectionDialog
          detection={deleting}
          name={plantName(deleting, m)}
          onClose={() => {
            setDeleting(null);
          }}
          onDeleted={() => {
            setDeleting(null);
            // The button that opened the dialog went with the card, so focus
            // would otherwise fall back to the top of the document.
            setTimeout(() => headingRef.current?.focus(), 0);
          }}
        />
      ) : null}
    </section>
  );
}
