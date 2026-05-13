'use client';

import styles from './MobileNav.module.scss';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export function MobileNav({
  items,
  activeId,
  onSelect,
}: {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={`${styles.iconWrap} ${isActive ? styles.iconWrapActive : ''}`}>
              {item.icon}
            </span>
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
