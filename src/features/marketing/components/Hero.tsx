import { Flower, TreeDeciduous } from 'lucide-react';

import { images } from '@/assets/images';
import { Button } from '@/components/ui/Button';
import { MushroomIcon } from '@/components/ui/icons/MushroomIcon';
import { Picture } from '@/components/ui/Picture';

import { SUBJECTS } from '../subjects';

import styles from './Hero.module.scss';

const SUBJECT_ICONS = {
  flowers: Flower,
  fungi: MushroomIcon,
  trees: TreeDeciduous,
} as const;

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.media}>
        <Picture
          image={images.mountain}
          /* Full-bleed, so it is always the viewport width. */
          sizes="100vw"
          /* The LCP element: the one image on the page that loads eagerly. */
          priority
        />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Field catalogue
          </p>

          <h1 className={styles.title}>Know what&rsquo;s growing around you.</h1>

          <p className={styles.lede}>
            Photograph anything that grows. Marka tells you what it is, then keeps the find in one
            catalogue that belongs to you.
          </p>

          <div className={styles.actions}>
            <Button asChild className={styles.primaryCta}>
              <a href="#start">Start your catalogue</a>
            </Button>
            <Button asChild variant="secondary" className={styles.secondaryCta}>
              <a href="#identify">See what it identifies</a>
            </Button>
          </div>

          <nav className={styles.subjects} aria-label="What Marka identifies">
            {SUBJECTS.map((subject) => {
              const Icon = SUBJECT_ICONS[subject.id];
              return (
                <a key={subject.id} href={`#${subject.id}`} className={styles.subject}>
                  <Icon className={styles.subjectIcon} aria-hidden="true" />
                  <span className={styles.subjectLabel}>{subject.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
