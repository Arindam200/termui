/**
 * useRenderTime — measures the time between renders.
 *
 * Returns the duration of the last render in milliseconds.
 * Useful for spotting slow renders during development.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const renderTime = useRenderTime();
 *   return <Text dimColor>render: {renderTime.toFixed(1)}ms</Text>;
 * }
 * ```
 */
import { useRef, useEffect } from 'react';

export interface RenderTiming {
  /** Duration of the last render in milliseconds */
  lastRenderMs: number;
  /** Total cumulative render time */
  totalMs: number;
  /** Number of renders */
  count: number;
}

export function useRenderTime(): RenderTiming {
  const startRef = useRef<number>(performance.now());
  const timingRef = useRef<RenderTiming>({ lastRenderMs: 0, totalMs: 0, count: 0 });

  const renderStart = performance.now();
  const elapsed = renderStart - startRef.current;

  useEffect(() => {
    const renderEnd = performance.now();
    const renderDuration = renderEnd - renderStart;
    timingRef.current = {
      lastRenderMs: renderDuration,
      totalMs: timingRef.current.totalMs + renderDuration,
      count: timingRef.current.count + 1,
    };
    startRef.current = performance.now();
  });

  return { ...timingRef.current, lastRenderMs: elapsed };
}
