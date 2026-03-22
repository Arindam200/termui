/**
 * useRenderCount — tracks how many times a component has rendered.
 *
 * Useful for debugging unnecessary re-renders during development.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const renderCount = useRenderCount();
 *   return <Text>Renders: {renderCount}</Text>;
 * }
 * ```
 */
import { useRef } from 'react';

export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
