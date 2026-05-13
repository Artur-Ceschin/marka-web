'use client';

import { Button } from '@/components/ui';
import { Modal } from '@/components/Modal';
import styles from './LimitModal.module.scss';

interface Props {
  open: boolean;
  code: 'USER_LIMIT' | 'SERVICE_LIMIT' | string;
  message: string;
  onClose: () => void;
}

const TITLES: Record<string, string> = {
  USER_LIMIT: 'Daily Limit Reached',
  SERVICE_LIMIT: 'Service Unavailable',
};

export function LimitModal({ open, code, message, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLES[code] ?? 'Limit Reached'}
      description={message}
    >
      <div className={styles.actions}>
        {code === 'USER_LIMIT' && (
          <p className={styles.hint}>
            Limits reset at midnight UTC. Upgrade to premium for unlimited identifications.
          </p>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={onClose}>
          Got it
        </Button>
      </div>
    </Modal>
  );
}
