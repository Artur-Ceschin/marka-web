import { useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { AppBar } from '@/components/layout/AppBar';

import { CatalogueGrid } from '../components/CatalogueGrid';
import { IdentifyPanel } from '../components/IdentifyPanel';
import { PhotoConfirm } from '../components/PhotoConfirm';
import { PhotoDropZone } from '../components/PhotoDropZone';
import { useIdentifyFlow } from '../hooks/use-identify-flow';

import styles from './PlantsHomePage.module.scss';

/**
 * The catalogue: add a plant by putting in a photo, see what you have found
 * below.
 *
 * Mobile first. On a phone the drop zone is a large tap target that opens the
 * camera or photo library, and every panel stacks to one column. Drag and drop
 * is a desktop layer on top of that same control, not a separate path.
 */
export function PlantsHomePage() {
  const { m } = useI18n();
  const flow = useIdentifyFlow();
  const [rejection, setRejection] = useState<string | null>(null);
  // Chosen but not sent: an identification costs one of ten daily tries, so
  // the photo is looked at first and only uploaded once it is confirmed.
  const [pending, setPending] = useState<File | null>(null);

  return (
    <div className={styles.page}>
      <AppBar />

      <main id="main" className={styles.main}>
        <h1 className={styles.title}>{m.plants.title}</h1>
        <p className={styles.subtitle}>{m.plants.subtitle}</p>

        {flow.state.phase !== 'idle' ? (
          <IdentifyPanel flow={flow} />
        ) : pending ? (
          <div>
            <PhotoConfirm
              photo={pending}
              onConfirm={() => {
                const photo = pending;
                setPending(null);
                void flow.start(photo);
              }}
              onChoose={(photo) => {
                setRejection(null);
                setPending(photo);
              }}
              onReject={setRejection}
            />
            {rejection ? (
              <p className={styles.rejection} role="alert">
                {rejection}
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <PhotoDropZone
              onPhoto={(photo) => {
                setRejection(null);
                setPending(photo);
              }}
              onReject={setRejection}
            />
            {rejection ? (
              <p className={styles.rejection} role="alert">
                {rejection}
              </p>
            ) : null}
          </div>
        )}

        <CatalogueGrid />
      </main>
    </div>
  );
}
