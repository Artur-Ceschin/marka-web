import { images } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { useReveal } from '@/lib/use-reveal';

import styles from './GoalBand.module.scss';

export function GoalBand() {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.band} id="goal" aria-labelledby="goal-heading">
      <div className={styles.media}>
        <Picture image={images.forestTropical} sizes="100vw" />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div ref={ref} className={[styles.inner, isVisible ? styles.innerVisible : ''].join(' ')}>
        <p className={styles.eyebrow}>Our goal</p>
        <h2 id="goal-heading" className={styles.statement}>
          A record of what grows here, before it doesn&rsquo;t.
        </h2>
        <p className={styles.body}>
          Most plant records are still locked in notebooks and camera rolls. Marka exists to turn
          the ones you make into something legible: dated, located, named, and yours to export.
        </p>
        <p className={styles.body}>
          Cataloguing for yourself is the whole point. That the result also happens to be the kind
          of record conservation work depends on is the reason we built it this way.
        </p>
      </div>
    </section>
  );
}
