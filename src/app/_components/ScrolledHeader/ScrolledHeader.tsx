'use client';

import { useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export function ScrolledHeader({ className, ...props }: ComponentPropsWithoutRef<'header'>) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <header {...props} className={className} data-scrolled={scrolled || undefined} />;
}
