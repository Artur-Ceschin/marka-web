import { useI18n } from '@/app/providers/i18n';
import { images } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { useReveal } from '@/lib/use-reveal';

import styles from './GoalBand.module.scss';

export function GoalBand() {
  const { m } = useI18n();
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.band} id="goal" aria-labelledby="goal-heading">
      <div className={styles.media}>
        <Picture image={images.forestTropical} sizes="100vw" />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div ref={ref} className={[styles.inner, isVisible ? styles.innerVisible : ''].join(' ')}>
        <p className={styles.eyebrow}>{m.goal.eyebrow}</p>
        <h2 id="goal-heading" className={styles.statement}>
          {m.goal.title}
        </h2>
        <p className={styles.body}>{m.goal.body1}</p>
        <p className={styles.body}>{m.goal.body2}</p>
      </div>
    </section>
  );
}
