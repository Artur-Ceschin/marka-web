'use client';

import { useRef, useCallback } from 'react';
import styles from './PhoneTilt.module.scss';

interface PhoneTiltProps {
  children: React.ReactNode;
  className?: string;
}

export function PhoneTilt({ children, className }: PhoneTiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${y * -12}deg`);
    el.style.setProperty('--ry', `${x * 12}deg`);
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.wrap} ${className ?? ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
