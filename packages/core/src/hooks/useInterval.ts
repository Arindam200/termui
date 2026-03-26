import { useEffect, useRef } from 'react';

/**
 * React-safe `setInterval` with automatic cleanup.
 *
 * Clears the interval when the component unmounts. The latest `callback`
 * reference is always used (no stale closure issues).
 *
 * @param callback - Function called on each interval tick.
 * @param delay - Interval delay in milliseconds. Pass `null` to pause.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * useInterval(() => setCount(c => c + 1), 1000);
 * // count increments every second
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
