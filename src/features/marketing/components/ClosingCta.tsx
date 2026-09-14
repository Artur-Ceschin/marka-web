import { Link } from '@tanstack/react-router';
import { useI18n } from '@/app/providers/i18n';
import { images } from '@/assets/images';
import { Button } from '@/components/ui/Button';
import { Picture } from '@/components/ui/Picture';
import { useReveal } from '@/lib/use-reveal';

import styles from './ClosingCta.module.scss';

export function ClosingCta() {
  const { m } = useI18n();
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} id="start" aria-labelledby="start-heading">
      <div className={styles.media}>
        <Picture image={images.lupine} sizes="100vw" />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div ref={ref} className={[styles.inner, isVisible ? styles.innerVisible : ''].join(' ')}>
        <h2 id="start-heading" className={styles.title}>
          {m.closing.title}
        </h2>
        <p className={styles.text}>{m.closing.text}</p>
        <div className={styles.actions}>
          <Button asChild className={styles.primaryCta}>
            <Link to="/sign-up">{m.closing.primaryCta}</Link>
          </Button>
          <Button asChild variant="secondary" className={styles.secondaryCta}>
            <a href="#identify">{m.closing.secondaryCta}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
