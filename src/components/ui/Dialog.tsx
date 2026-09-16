import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef } from 'react';

import { useI18n } from '@/app/providers/i18n';

import styles from './Dialog.module.scss';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Read out with the title when the dialog opens. */
  description?: ReactNode;
  children: ReactNode;
  /** While true, Escape, the backdrop and the close button do nothing. */
  busy?: boolean;
  /** `alertdialog` for confirmations of something destructive. */
  role?: 'dialog' | 'alertdialog';
  /** `lg` for content that needs the room, such as a plant's full record. */
  size?: 'md' | 'lg';
  /**
   * `bare` drops the header and the padding, for content that brings its own
   * heading (a full-bleed photo with the name over it). The close button then
   * floats above that content, and `title` becomes the dialog's own label.
   */
  chrome?: 'default' | 'bare';
}

/**
 * A modal on the native `<dialog>` element.
 *
 * `showModal()` already does the hard parts correctly: focus moves inside,
 * the rest of the page becomes inert (so Tab cannot wander behind it), and
 * Escape closes it. No library, and nothing to get subtly wrong.
 *
 * A bottom sheet on phones, where it is within thumb reach; a centred panel
 * from 560px.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  busy = false,
  role = 'dialog',
  size = 'md',
  chrome = 'default',
}: DialogProps) {
  const { m } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  // Read inside the native listener, so a new onClose each render never
  // re-runs the effect (which would close and reopen the dialog).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    // The browser queues the close event instead of firing it at once. Under
    // StrictMode's mount, unmount, mount in development, the cleanup's close()
    // lands AFTER the dialog has been reopened, and treating it as the person
    // closing the dialog made every dialog vanish the moment it opened. A
    // real close (Escape) leaves the dialog closed when the event arrives.
    const handleClose = () => {
      if (!dialog.open) onCloseRef.current();
    };
    dialog.addEventListener('close', handleClose);
    if (!dialog.open) dialog.showModal();
    // A modal does not stop the page behind it scrolling, which on a phone
    // means a swipe inside the sheet can drag the whole catalogue along.
    root.style.overflow = 'hidden';

    return () => {
      dialog.removeEventListener('close', handleClose);
      root.style.overflow = overflow;
      if (dialog.open) dialog.close();
      // The native dialog restores focus only when closed in place. Dialogs
      // here unmount instead, so focus goes back by hand, and only if the
      // trigger still exists: a deleted card's button does not.
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click only catches the backdrop; Escape is handled natively by the dialog.
    <dialog
      ref={ref}
      className={[styles.dialog, size === 'lg' ? styles.wide : ''].filter(Boolean).join(' ')}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      {...(chrome === 'bare'
        ? { 'aria-label': title }
        : {
            'aria-labelledby': titleId,
            'aria-describedby': description ? descriptionId : undefined,
          })}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      onClick={(event) => {
        // The dialog itself has no padding, so a click whose target is the
        // dialog element can only have landed on the backdrop.
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className={chrome === 'bare' ? styles.innerBare : styles.inner}>
        {chrome === 'bare' ? (
          <button
            type="button"
            className={styles.closeFloating}
            onClick={onClose}
            disabled={busy}
            aria-label={m.common.close}
          >
            <X aria-hidden="true" />
          </button>
        ) : (
          <header className={styles.header}>
            <div className={styles.heading}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              disabled={busy}
              aria-label={m.common.close}
            >
              <X aria-hidden="true" />
            </button>
          </header>
        )}
        {children}
      </div>
    </dialog>
  );
}
