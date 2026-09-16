import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { useI18n } from '@/app/providers/i18n';
import { Button } from '@/components/ui/Button';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { signOut } from '@/lib/auth/use-auth';

import { CatalogueGrid } from '../components/CatalogueGrid';
import { IdentifyPanel } from '../components/IdentifyPanel';
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const flow = useIdentifyFlow();
  const [rejection, setRejection] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Logo />
        <div className={styles.actions}>
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              signOut();
              // Cached responses belong to the account that fetched them and
              // must not be shown to whoever signs in next on this device.
              queryClient.clear();
              void navigate({ to: '/' });
            }}
          >
            {m.app.signOut}
          </Button>
        </div>
      </header>

      <main id="main" className={styles.main}>
        <h1 className={styles.title}>{m.plants.title}</h1>
        <p className={styles.subtitle}>{m.plants.subtitle}</p>

        {flow.state.phase === 'idle' ? (
          <div>
            <PhotoDropZone
              onPhoto={(photo) => {
                setRejection(null);
                void flow.start(photo);
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
          <IdentifyPanel flow={flow} />
        )}

        <CatalogueGrid />
      </main>
    </div>
  );
}
