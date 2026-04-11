import { useEffect, useRef } from 'react';
import { useInput } from './useInput.js';
import { useFocusManager } from './useFocusManager.js';

export interface FocusTrapOptions {
  /**
   * Ordered list of focus IDs to trap within.
   * Each ID must match the `id` passed to `useFocus({ id })` on the target component.
   */
  focusableIds: string[];
  /**
   * Whether the trap is currently active. Defaults to true.
   * Set to false when the container is closed/hidden to release focus.
   */
  isActive?: boolean;
}

/**
 * Trap keyboard focus within a set of focusable components.
 *
 * When active, Tab cycles forward and Shift+Tab cycles backward through the
 * provided `focusableIds` list without escaping to the rest of the app.
 * Intended for Modal, Dialog, Drawer, CommandPalette, and similar overlay components.
 *
 * Each ID in `focusableIds` must be registered with `useFocus({ id: '...' })` on
 * the corresponding component.
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
 *   useFocusTrap({
 *     focusableIds: ['modal-confirm', 'modal-cancel'],
 *     isActive: isOpen,
 *   });
 *
 *   const { isFocused: confirmFocused } = useFocus({ id: 'modal-confirm' });
 *   const { isFocused: cancelFocused } = useFocus({ id: 'modal-cancel' });
 *
 *   useInput((_, key) => { if (key.escape) onClose(); }, { isActive: isOpen });
 *
 *   return (
 *     <Box flexDirection="column">
 *       <Text>Confirm action?</Text>
 *       <Text color={confirmFocused ? 'cyan' : undefined}>[Yes]</Text>
 *       <Text color={cancelFocused ? 'cyan' : undefined}>[No]</Text>
 *     </Box>
 *   );
 * }
 * ```
 */
export function useFocusTrap(options: FocusTrapOptions): void {
  const { focusableIds, isActive = true } = options;
  const { focus } = useFocusManager();
  const currentIndexRef = useRef(0);

  // Move focus to the first focusable element when the trap activates
  useEffect(() => {
    if (isActive && focusableIds.length > 0) {
      currentIndexRef.current = 0;
      focus(focusableIds[0]!);
    }
  }, [isActive, focusableIds, focus]);

  useInput(
    (_input, key) => {
      if (focusableIds.length === 0) return;

      if (key.tab) {
        if (key.shift) {
          currentIndexRef.current =
            (currentIndexRef.current - 1 + focusableIds.length) % focusableIds.length;
        } else {
          currentIndexRef.current = (currentIndexRef.current + 1) % focusableIds.length;
        }
        focus(focusableIds[currentIndexRef.current]!);
      }
    },
    { isActive: isActive && focusableIds.length > 0 }
  );
}
