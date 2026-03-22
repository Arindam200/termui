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
 * Declarative keybinding registration with conflict detection.
 * Pass an array of KeyBinding objects; the hook handles matching and invocation.
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

  useInput((input: string, key: Key) => {
    for (const binding of bindingsRef.current) {
      const keyMatch = !binding.key || input === binding.key;
      const ctrlMatch = binding.ctrl === undefined || binding.ctrl === key.ctrl;
      const shiftMatch = binding.shift === undefined || binding.shift === key.shift;
      const metaMatch = binding.meta === undefined || binding.meta === key.meta;
      if (keyMatch && ctrlMatch && shiftMatch && metaMatch) {
        binding.action();
      }
    }
  }, { isActive });
}
