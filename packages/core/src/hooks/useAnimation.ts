import { useState, useEffect, useRef } from 'react';

/**
 * Frame-based animation hook at configurable fps.
 * Returns the current frame index (increments every tick).
 */
export function useAnimation(fps = 12): number {
  const [frame, setFrame] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ms = Math.round(1000 / fps);
    intervalRef.current = setInterval(() => {
      setFrame((f) => f + 1);
    }, ms);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fps]);

  return frame;
}
