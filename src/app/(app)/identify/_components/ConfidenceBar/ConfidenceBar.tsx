import styles from './ConfidenceBar.module.scss';

type Tone = 'high' | 'medium' | 'low';

function toneFor(pct: number): Tone {
  if (pct >= 80) return 'high';
  if (pct >= 50) return 'medium';
  return 'low';
}

function labelFor(pct: number) {
  if (pct >= 80) return 'High Confidence';
  if (pct >= 50) return 'Medium Confidence';
  return 'Low Confidence';
}

export function ConfidenceBar({ pct }: { pct: number }) {
  const safe = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={styles.bar}
      data-tone={toneFor(safe)}
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${safe}%` }} />
      <span className={styles.label}>
        {labelFor(safe)} · {safe}%
      </span>
    </div>
  );
}
