import Link from 'next/link';
import { LeafMark } from '@/components/MarkaLogo';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.content}>
        <Link href="/" className={styles.logo}>
          <LeafMark size={28} />
          <span className={styles.logoText}>marka</span>
        </Link>

        <div className={styles.body}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            <span className={styles.eyebrowLabel}>Species Not Found</span>
            <span className={styles.eyebrowLine} />
          </div>

          <h1 className={styles.heading}>
            404
            <span className={styles.headingItalic}>Lost in the Field</span>
          </h1>

          <p className={styles.description}>
            The specimen you&apos;re looking for has wandered off the path. It may have been moved,
            removed, or never existed in our records.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.btnPrimary}>
              Return to Base Camp
            </Link>
            <Link href="/identify" className={styles.btnSecondary}>
              Identify a Plant
            </Link>
          </div>
        </div>

        <p className={styles.footer}>© 2026 Marka — All Observations Logged</p>
      </div>
    </div>
  );
}
