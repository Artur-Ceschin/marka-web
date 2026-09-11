import { Link } from '@tanstack/react-router';
import { images } from '@/assets/images';
import { Button } from '@/components/ui/Button';
import { Picture } from '@/components/ui/Picture';
import { useReveal } from '@/lib/use-reveal';

import styles from './ClosingCta.module.scss';

export function ClosingCta() {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} id="start" aria-labelledby="start-heading">
      <div className={styles.media}>
        <Picture image={images.lupine} sizes="100vw" />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div ref={ref} className={[styles.inner, isVisible ? styles.innerVisible : ''].join(' ')}>
        <h2 id="start-heading" className={styles.title}>
          Start with the one outside your window.
        </h2>
        <p className={styles.text}>
          A catalogue does not need to begin with a field trip. Photograph whatever is nearest and
          see what Marka makes of it.
        </p>
        <div className={styles.actions}>
          <Button asChild className={styles.primaryCta}>
            <Link to="/sign-up">Start your catalogue</Link>
          </Button>
          <Button asChild variant="secondary" className={styles.secondaryCta}>
            <a href="#identify">See how it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
