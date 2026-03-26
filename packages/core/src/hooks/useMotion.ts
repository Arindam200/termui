/**
 * useMotion — reduced-motion support hook.
 *
 * Reads NO_MOTION env var at startup and exposes it via context so
 * animated components (Spinner, ProgressBar, Skeleton, StreamingText) can
 * automatically degrade to static output.
 *
 * CI environments (CI=true) default to reduced motion.
 */
import { useContext, createContext } from 'react';

export interface MotionContextValue {
  /** true when NO_MOTION=1 or CI=true, or reducedMotion prop is set */
  reduced: boolean;
}

export const MotionContext = createContext<MotionContextValue>({
  reduced: isReducedMotion(),
});

export function isReducedMotion(): boolean {
  return process.env['NO_MOTION'] === '1' || process.env['CI'] === 'true';
}

/**
 * Check if the user has requested reduced motion.
 *
 * Returns `{ reduced: boolean }`. When `reduced` is true, animated components
 * should show static alternatives (e.g. `[…]` instead of a spinning animation).
 *
 * `reduced` is true when:
 * - `NO_MOTION=1` environment variable is set
 * - `CI=true` environment variable is set (CI logs don't need animations)
 * - `ThemeProvider` was given `reducedMotion={true}`
 *
 * @returns `MotionContextValue` — `{ reduced: boolean }`.
 *
 * @example
 * ```tsx
 * function MyAnimation() {
 *   const { reduced } = useMotion();
 *   if (reduced) return <Text>[loading…]</Text>;
 *   return <Spinner />;
 * }
 * ```
 */
export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}
