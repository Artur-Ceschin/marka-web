import { useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

import type { Detection } from '../api/identify-api';
import { useDeleteDetection } from '../api/queries';
import { describePlantError } from '../lib/describe-plant-error';

import styles from './EditDetectionDialog.module.scss';

interface DeleteDetectionDialogProps {
  detection: Detection;
  name: string;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * Confirmation before removing a plant and its photo.
 *
 * Says plainly that the daily credit is not given back, because that is the
 * one consequence nobody would guess.
 */
export function DeleteDetectionDialog({
  detection,
  name,
  onClose,
  onDeleted,
}: DeleteDetectionDialogProps) {
  const { m, locale } = useI18n();
  const remove = useDeleteDetection();
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog
      open
      role="alertdialog"
      title={m.plants.deleteTitle}
      description={m.plants.deleteBody(name)}
      onClose={onClose}
      busy={remove.isPending}
    >
      <div className={styles.form}>
        <p className={styles.count}>{m.plants.deleteCredit}</p>
        {error ? (
          <p className={styles.notice} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={remove.isPending}>
            {m.plants.cancel}
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={async () => {
              setError(null);
              try {
                await remove.mutateAsync(detection.detectionId);
                onDeleted();
              } catch (cause) {
                setError(describePlantError(cause, m, locale).title);
              }
            }}
          >
            {remove.isPending ? m.plants.deleting : m.plants.deleteConfirm}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
