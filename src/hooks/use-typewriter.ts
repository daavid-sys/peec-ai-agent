import { useEffect, useRef, useState } from "react";

/**
 * Streams `text` character-by-character. When `text` changes, it resets and
 * re-types from the start. Returns the currently-typed substring and whether
 * typing is complete.
 *
 * `cps` is characters per second. We batch frames so it stays smooth.
 */
export function useTypewriter(
  text: string,
  options: { cps?: number; enabled?: boolean } = {},
) {
  const cps = options.cps ?? 220;
  const enabled = options.enabled ?? true;
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setOut("");
    setDone(false);
    if (!enabled || !text) {
      setOut(text ?? "");
      setDone(true);
      return;
    }

    const start = performance.now();
    const total = text.length;

    const tick = (now: number) => {
      const elapsedSec = (now - start) / 1000;
      const target = Math.min(total, Math.floor(elapsedSec * cps));
      setOut(text.slice(0, target));
      if (target >= total) {
        setDone(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, cps, enabled]);

  return { text: out, done };
}
