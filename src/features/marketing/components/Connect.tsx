import { Database, Globe, Leaf, Waypoints } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useI18n } from '@/app/providers/i18n';
import { images } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { useReveal } from '@/lib/use-reveal';
import styles from './Connect.module.scss';

interface Integration {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  text: string;
}

export function Connect() {
  const { m } = useI18n();
  // Service names are proper nouns and stay put; only their descriptions move.
  const integrations: Integration[] = [
    { icon: Leaf, name: 'iNaturalist', text: m.connect.inaturalist },
    { icon: Database, name: 'GBIF', text: m.connect.gbif },
    { icon: Globe, name: 'IUCN Red List', text: m.connect.iucn },
    { icon: Waypoints, name: 'Pl@ntNet', text: m.connect.plantnet },
  ];
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} id="connect" aria-labelledby="connect-heading">
      <div ref={ref} className={[styles.panel, isVisible ? styles.panelVisible : ''].join(' ')}>
        <div>
          <p className={styles.eyebrow}>{m.connect.eyebrow}</p>
          <h2 id="connect-heading" className={styles.title}>
            {m.connect.title}
          </h2>
          <p className={styles.text}>{m.connect.text}</p>

          <ul className={styles.list}>
            {integrations.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className={styles.item}>
                  <Icon className={styles.itemIcon} aria-hidden="true" />
                  <div>
                    <p className={styles.itemName}>
                      {item.name}
                      <span className={styles.badge}>{m.common.planned}</span>
                    </p>
                    <p className={styles.itemText}>{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.media}>
          <Picture image={images.forest} sizes="(min-width: 900px) 44vw, 92vw" />
        </div>
      </div>
    </section>
  );
}
