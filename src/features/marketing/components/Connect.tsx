import { Database, Globe, Leaf, Waypoints } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { images } from '@/assets/images';
import { Picture } from '@/components/ui/Picture';
import { useReveal } from '@/lib/use-reveal';
import styles from './Connect.module.scss';

interface Integration {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  text: string;
}

const INTEGRATIONS: Integration[] = [
  {
    icon: Leaf,
    name: 'iNaturalist',
    text: 'Push an observation you are happy with to the community that will verify it.',
  },
  {
    icon: Database,
    name: 'GBIF',
    text: 'The global occurrence record researchers actually query. Your finds can land there.',
  },
  {
    icon: Globe,
    name: 'IUCN Red List',
    text: 'The conservation status behind every threatened-species flag Marka raises.',
  },
  {
    icon: Waypoints,
    name: 'Pl@ntNet',
    text: 'A second opinion on an identification when the first one is not convincing.',
  },
];

export function Connect() {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} id="connect" aria-labelledby="connect-heading">
      <div ref={ref} className={[styles.panel, isVisible ? styles.panelVisible : ''].join(' ')}>
        <div>
          <p className={styles.eyebrow}>Connections</p>
          <h2 id="connect-heading" className={styles.title}>
            Built to plug into the records that already exist.
          </h2>
          <p className={styles.text}>
            There is a working open infrastructure for biodiversity data, and Marka has no interest
            in replacing it. These are the services we intend to connect to, so your catalogue is
            never trapped in one app.
          </p>

          <ul className={styles.list}>
            {INTEGRATIONS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className={styles.item}>
                  <Icon className={styles.itemIcon} aria-hidden="true" />
                  <div>
                    <p className={styles.itemName}>
                      {item.name}
                      <span className={styles.badge}>Planned</span>
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
