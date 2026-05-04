"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroVideo.module.scss";

export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      /* autoplay blocked — silently ignore */
    });
  }, []);

  return <video ref={ref} className={styles.video} src={src} autoPlay muted loop playsInline />;
}
