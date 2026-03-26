import { useState, useEffect } from 'react';

// Shared interval pool: one setInterval per fps bucket.
// All spinners at the same fps share one timer, so React 18 can batch
// their setState calls into a single re-render per tick.
type Subscriber = (tick: number) => void;
const pool = new Map<
  number,
  { id: ReturnType<typeof setInterval>; tick: number; subs: Set<Subscriber> }
>();

function subscribe(ms: number, cb: Subscriber) {
  if (!pool.has(ms)) {
    const entry = {
      id: null as unknown as ReturnType<typeof setInterval>,
      tick: 0,
      subs: new Set<Subscriber>(),
    };
    entry.id = setInterval(() => {
      entry.tick++;
      for (const sub of entry.subs) sub(entry.tick);
    }, ms);
    pool.set(ms, entry);
  }
  pool.get(ms)!.subs.add(cb);
}

function unsubscribe(ms: number, cb: Subscriber) {
  const entry = pool.get(ms);
  if (!entry) return;
  entry.subs.delete(cb);
  if (entry.subs.size === 0) {
    clearInterval(entry.id);
    pool.delete(ms);
  }
}

/**
 * Drive frame-based animations at a configurable frame rate.
 *
 * Returns a monotonically increasing frame counter. Use `frame % frames.length`
 * to cycle through animation frames. The counter increments at `fps` times per
 * second using `requestAnimationFrame`-equivalent timing.
 *
 * All instances at the same fps share a single interval for efficient batching —
 * React 18 can batch their `setState` calls into a single re-render per tick.
 *
 * @param fps - Frames per second (default: 12). Lower values (6–10) save CPU;
 *   higher values (24–30) produce smoother animations.
 * @returns Current frame index (increments at the given fps rate).
 *
 * @example
 * ```tsx
 * const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴'];
 * function Spinner() {
 *   const frame = useAnimation(12);
 *   return <Text>{FRAMES[frame % FRAMES.length]}</Text>;
 * }
 * ```
 */
export function useAnimation(fps = 12): number {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const ms = Math.round(1000 / fps);
    const cb: Subscriber = (tick) => setFrame(tick);
    subscribe(ms, cb);
    return () => unsubscribe(ms, cb);
  }, [fps]);

  return frame;
}
