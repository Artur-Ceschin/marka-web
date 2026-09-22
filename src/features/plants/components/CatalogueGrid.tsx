import { Pencil, Trash2 } from 'lucide-react';
import { type ReactNode, useId, useMemo, useRef } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';

import { useIdentifications } from '../api/queries';
import { plantNames } from '../lib/plant-names';

import styles from './CatalogueGrid.module.scss';
import { usePlantDialogs } from './usePlantDialogs';

/** Every identification, newest first: two columns on a phone, more as it widens. */
export function CatalogueGrid() {
  const { m, locale } = useI18n();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const query = useIdentifications();
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
    [locale],
  );
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const dialogs = usePlantDialogs(items, () => {
    // The button that opened the dialog went with the card, so focus would
    // otherwise fall back to the top of the document.
    setTimeout(() => headingRef.current?.focus(), 0);
  });

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
            const names = plantNames(item, m);
            const title = names.common ?? names.scientific;
            const seen = item.observedAt ? formatDate(item.observedAt) : null;
            const created = formatDate(item.createdAt);
            return (
              <li key={item.detectionId} className={styles.card}>
                <div className={styles.media}>
                  <img
                    // A few kilobytes instead of the full photo; older detections
                    // and PNG uploads have no thumbnail and use the original.
                    src={item.thumbnailUrl ?? item.imageUrl}
                    alt={title}
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
                </div>

                <p className={styles.name} title={title}>
                  {title}
                </p>
                {/* Only worth a second line when it says something new. */}
                {names.common ? (
                  <p className={styles.scientific} title={names.scientific}>
                    {names.scientific}
                  </p>
                ) : null}
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

                {/* One real button covering the card, rather than a click
                    handler on the <li>: it is tabbable, has a name, and works
                    with Enter and Space for free. It sits under the icon
                    buttons, which stay clickable. */}
                <button
                  type="button"
                  className={styles.open}
                  aria-label={m.plants.openPlant(title)}
                  onClick={() => {
                    dialogs.view(item);
                  }}
                />
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

      {dialogs.element}
    </section>
  );
}
