'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroVideo.module.scss';

export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch((err) => {
      console.warn('Hero video autoplay failed:', err);
      setFailed(true);
    });
  }, []);

  if (failed && poster) {
    return <img src={poster} className={styles.video} alt="" aria-hidden="true" />;
  }

  return (
    <video
      ref={ref}
      className={styles.video}
      src={src}
      autoPlay
      poster={poster}
      onError={() => setFailed(true)}
    />
  );
}
