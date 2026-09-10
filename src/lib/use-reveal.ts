import { useEffect, useRef, useState } from 'react';

interface UseRevealOptions {
  /**
   * How far the element must be into the viewport before it counts as
   * revealed, as a fraction of its own height.
   */
  threshold?: number;
  /**
   * Reveal once and stop observing. Re-animating on every scroll-by is
   * distracting on a long page, so this defaults on.
   */
  once?: boolean;
}

/**
 * Reveals an element when it scrolls into view.
 *
 * Returns a ref to attach and a boolean to drive the class. The animation
 * itself is entirely CSS (see the `reveal` / `reveal-visible` mixins): this
 * hook only decides *when*, which keeps the motion off the main thread and
 * means reduced-motion users get the correct result even if the observer
 * never fires.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  once = true,
}: UseRevealOptions = {}) {
  const ref = useRef<T>(null);
  // Lazy initial state rather than a setState inside the effect: where there is
  // no IntersectionObserver (jsdom, very old engines) the content must start
  // visible, or it stays stuck at opacity 0 forever. Deciding it here also
  // avoids the cascading render that setting state in an effect body causes.
  const [isVisible, setIsVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  return { ref, isVisible };
}
