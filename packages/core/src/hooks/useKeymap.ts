import { useEffect, useRef } from 'react';
import { useInput } from './useInput.js';
import type { Key } from './useInput.js';

export type KeyBinding = {
  key?: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
};

/**
 * Register declarative keybindings with conflict detection.
 *
 * Provides a structured way to declare keyboard shortcuts. Conflicts
 * (two handlers registered for the same key combination) are warned at runtime.
 *
 * @param bindings - Array of `KeyBinding` objects with `key`, optional modifier
 *   flags (`ctrl`, `shift`, `meta`), and an `action` callback. `key` can be a
 *   single character or a special key name (`escape`, `return`).
 * @param isActive - Whether input handling is active (default: true).
 *   Set to `false` to pause all bindings without unmounting.
 *
 * @example
 * ```tsx
 * useKeymap([
 *   { key: 'q',      action: () => process.exit(0) },
 *   { key: 'r',      action: reload },
 *   { key: 'c', ctrl: true, action: () => process.exit(0) },
 * ]);
 * ```
 */
export function useKeymap(bindings: KeyBinding[], isActive = true): void {
  const bindingsRef = useRef(bindings);

  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  // Detect conflicts on mount
  useEffect(() => {
    const seen = new Set<string>();
    for (const b of bindings) {
      const id = `${b.key ?? ''}:${b.ctrl ? 'ctrl' : ''}:${b.shift ? 'shift' : ''}:${b.meta ? 'meta' : ''}`;
      if (seen.has(id)) {
        console.warn(`[useKeymap] Conflicting keybinding: ${id}`);
      }
      seen.add(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInput(
    (input: string, key: Key) => {
      for (const binding of bindingsRef.current) {
        const keyMatch = !binding.key || input === binding.key;
        const ctrlMatch = binding.ctrl === undefined || binding.ctrl === key.ctrl;
        const shiftMatch = binding.shift === undefined || binding.shift === key.shift;
        const metaMatch = binding.meta === undefined || binding.meta === key.meta;
        if (keyMatch && ctrlMatch && shiftMatch && metaMatch) {
          binding.action();
        }
      }
    },
    { isActive }
  );
}
