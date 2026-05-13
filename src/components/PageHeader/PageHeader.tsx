import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <span className={styles.bubble1} aria-hidden="true" />
      <span className={styles.bubble2} aria-hidden="true" />
      <span className={styles.bubble3} aria-hidden="true" />
      <span className={styles.bubble4} aria-hidden="true" />
      <div className={styles.headerContent}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
