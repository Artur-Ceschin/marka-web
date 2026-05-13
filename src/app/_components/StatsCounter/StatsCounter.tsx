'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './StatsCounter.module.scss';

const FACTS = [
  { value: '5', label: 'Free IDs per day', animate: true, end: 5 },
  { value: 'Free', label: 'No credit card, ever', animate: false, end: 0 },
  { value: 'GPS', label: 'Location tagging', animate: false, end: 0 },
  { value: 'Yours', label: 'Your data, always', animate: false, end: 0 },
];

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4;
}

export function StatsCounter() {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const DURATION = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      setCount(Math.round(easeOutQuart(progress) * 5));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started]);

  return (
    <section ref={ref} className={styles.stats}>
      {FACTS.map((fact) => (
        <div key={fact.label} className={styles.stat}>
          <span className={styles.num}>{fact.animate ? count : fact.value}</span>
          <span className={styles.label}>{fact.label}</span>
        </div>
      ))}
    </section>
  );
}
