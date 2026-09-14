import { useEffect, useRef, useState } from 'react';

interface UseTypewriterOptions {
  /** Milliseconds between characters. */
  speed?: number;
  /** Wait before the first character, to let an entrance animation land. */
  startDelay?: number;
}

/**
 * Reveals a string one character at a time.
 *
 * Returns the visible slice plus whether it has finished. It does NOT decide
 * what to render: the caller is responsible for keeping the full string in the
 * accessibility tree, because a partially typed sentence is meaningless to a
 * screen reader and re-announcing on every character is worse than useless.
 *
 * Under `prefers-reduced-motion` it returns the complete string immediately and
 * never schedules a timer.
 */
export function useTypewriter(
  text: string,
  { speed = 45, startDelay = 350 }: UseTypewriterOptions = {},
) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [count, setCount] = useState(() => (prefersReduced ? text.length : 0));
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prefersReduced) {
      setCount(text.length);
      return;
    }

    setCount(0);
    let cancelled = false;
    let index = 0;
    let last = 0;

    // rAF rather than setInterval: it pauses with the tab, so a backgrounded
    // page does not burn through the whole animation and reveal the text
    // instantly on return.
    const step = (now: number) => {
      if (cancelled) return;
      if (!last) last = now;
      const due = Math.floor((now - last) / speed);
      if (due > index) {
        index = Math.min(due, text.length);
        setCount(index);
      }
      if (index < text.length) frame.current = requestAnimationFrame(step);
    };

    const timer = setTimeout(() => {
      frame.current = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [text, speed, startDelay, prefersReduced]);

  return { typed: text.slice(0, count), done: count >= text.length };
}
