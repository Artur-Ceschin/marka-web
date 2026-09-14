import { Link } from '@tanstack/react-router';
import { Flower, TreeDeciduous } from 'lucide-react';
import { useI18n } from '@/app/providers/i18n';

import { images } from '@/assets/images';
import { Button } from '@/components/ui/Button';
import { MushroomIcon } from '@/components/ui/icons/MushroomIcon';
import { Picture } from '@/components/ui/Picture';
import { useTypewriter } from '@/lib/use-typewriter';

import { getSubjects } from '../subjects';

import styles from './Hero.module.scss';

const SUBJECT_ICONS = {
  flowers: Flower,
  fungi: MushroomIcon,
  trees: TreeDeciduous,
} as const;

export function Hero() {
  const { m } = useI18n();
  const subjects = getSubjects(m);
  // Retyped when the language changes, which is the right behaviour: the new
  // sentence should arrive the same way the first one did.
  const { typed, done } = useTypewriter(m.hero.title);

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
            {m.hero.eyebrow}
          </p>

          <h1 className={styles.title}>
            {/* The full sentence, always complete, for screen readers. A
                partially typed string is meaningless read aloud, and
                re-announcing on every character would be intolerable. */}
            <span className="sr-only">{m.hero.title}</span>
            <span className={styles.typeLine} aria-hidden="true">
              {/* Invisible full-length copy holds the box open, so the line
                  never reflows as characters arrive. */}
              <span className={styles.typeGhost}>{m.hero.title}</span>
              <span className={styles.typeVisible}>
                {typed}
                <span
                  className={[styles.caret, done ? styles.caretDone : ''].filter(Boolean).join(' ')}
                />
              </span>
            </span>
          </h1>

          <p className={styles.lede}>{m.hero.lede}</p>

          <div className={styles.actions}>
            <Button asChild className={styles.primaryCta}>
              <Link to="/sign-up">{m.hero.primaryCta}</Link>
            </Button>
            <Button asChild variant="secondary" className={styles.secondaryCta}>
              <a href="#identify">{m.hero.secondaryCta}</a>
            </Button>
          </div>

          <nav className={styles.subjects} aria-label={m.hero.subjectsLabel}>
            {subjects.map((subject) => {
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
