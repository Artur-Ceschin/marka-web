import { type ReactNode, useState } from 'react';

import { useI18n } from '@/app/providers/i18n';

import type { Detection } from '../api/identify-api';
import { primaryName } from '../lib/plant-names';

import { DeleteDetectionDialog } from './DeleteDetectionDialog';
import { DetectionDetails } from './DetectionDetails';
import { EditDetectionDialog } from './EditDetectionDialog';

export interface PlantDialogs {
  /** Open the full record. */
  view: (item: Detection) => void;
  edit: (item: Detection) => void;
  remove: (item: Detection) => void;
  /** Render this once, anywhere in the tree. */
  element: ReactNode;
}

/**
 * The details, edit and delete dialogs for a list of plants.
 *
 * Shared by the catalogue grid and the journal so both behave identically:
 * the same three sheets, the same order (details, then edit or delete from
 * inside it), and the same handling of a record that changed underneath.
 *
 * `items` is the current list from the cache. Every dialog reads its plant
 * from it rather than from the snapshot taken when it opened, so an edit shows
 * immediately when the details reappear.
 */
export function usePlantDialogs(items: Detection[], onDeleted?: () => void): PlantDialogs {
  const { m } = useI18n();
  const [viewing, setViewing] = useState<Detection | null>(null);
  const [editing, setEditing] = useState<Detection | null>(null);
  const [deleting, setDeleting] = useState<Detection | null>(null);

  const fresh = (item: Detection) =>
    items.find((candidate) => candidate.detectionId === item.detectionId) ?? item;

  const element = (
    <>
      {/* The details step back while a sheet opened from it is showing, rather
          than stacking two modals on top of each other. */}
      {viewing && !editing && !deleting ? (
        <DetectionDetails
          detection={fresh(viewing)}
          onClose={() => {
            setViewing(null);
          }}
          onEdit={() => {
            setEditing(viewing);
          }}
          onDelete={() => {
            setDeleting(viewing);
          }}
        />
      ) : null}

      {editing ? (
        <EditDetectionDialog
          detection={fresh(editing)}
          name={primaryName(fresh(editing), m)}
          onClose={() => {
            setEditing(null);
          }}
        />
      ) : null}

      {deleting ? (
        <DeleteDetectionDialog
          detection={deleting}
          name={primaryName(deleting, m)}
          onClose={() => {
            setDeleting(null);
          }}
          onDeleted={() => {
            setDeleting(null);
            setViewing(null);
            onDeleted?.();
          }}
        />
      ) : null}
    </>
  );

  return { view: setViewing, edit: setEditing, remove: setDeleting, element };
}
