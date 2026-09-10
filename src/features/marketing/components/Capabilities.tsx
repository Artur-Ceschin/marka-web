import { Flower, Gauge, Globe, TreeDeciduous, TriangleAlert } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { MushroomIcon } from '@/components/ui/icons/MushroomIcon';
import { Picture } from '@/components/ui/Picture';
import { useReveal } from '@/lib/use-reveal';
import { SUBJECTS, type Subject } from '../subjects';
import styles from './Capabilities.module.scss';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const SUBJECT_ICONS: Record<Subject['id'], IconType> = {
  flowers: Flower,
  fungi: MushroomIcon,
  trees: TreeDeciduous,
};

const CAVEAT_ICONS: Record<Subject['id'], IconType> = {
  flowers: Gauge,
  fungi: TriangleAlert,
  trees: Globe,
};

export function Capabilities() {
  const { ref: headRef, isVisible: headVisible } = useReveal<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } = useReveal<HTMLUListElement>();

  return (
    <section className={styles.section} id="identify" aria-labelledby="identify-heading">
      <div ref={headRef} className={[styles.head, headVisible ? styles.headVisible : ''].join(' ')}>
        <p className={styles.eyebrow}>What it identifies</p>
        <h2 id="identify-heading" className={styles.title}>
          Point it at anything that grows.
        </h2>
        <p className={styles.intro}>
          Flowers, fungi, trees: the same photograph, the same catalogue. What changes is how much
          certainty Marka can honestly give you, and it says so every time.
        </p>
      </div>

      <ul ref={gridRef} className={styles.grid}>
        {SUBJECTS.map((subject) => {
          const Icon = SUBJECT_ICONS[subject.id];
          const CaveatIcon = CAVEAT_ICONS[subject.id];
          const isDanger = subject.id === 'fungi';

          return (
            <li
              key={subject.id}
              id={subject.id}
              className={[styles.card, gridVisible ? styles.cardVisible : ''].join(' ')}
            >
              <div className={styles.media}>
                {/* Three columns above 720px, one below: mirrored here so the
                    browser picks the right candidate before layout. */}
                <Picture image={subject.image} sizes="(min-width: 720px) 31vw, 92vw" />
                <div className={styles.mediaScrim} aria-hidden="true" />
                <div className={styles.mediaLabel}>
                  <Icon className={styles.labelIcon} aria-hidden="true" />
                  <h3 className={styles.label}>{subject.label}</h3>
                </div>
              </div>

              <p className={styles.headline}>{subject.headline}</p>
              <p className={styles.text}>{subject.text}</p>
              <p className={[styles.caveat, isDanger ? styles.caveatDanger : ''].join(' ')}>
                <CaveatIcon className={styles.caveatIcon} aria-hidden="true" />
                <span>{subject.caveat}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
