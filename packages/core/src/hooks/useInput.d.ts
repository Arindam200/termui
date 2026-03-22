export type Key = {
  upArrow: boolean;
  downArrow: boolean;
  leftArrow: boolean;
  rightArrow: boolean;
  pageDown: boolean;
  pageUp: boolean;
  return: boolean;
  escape: boolean;
  ctrl: boolean;
  shift: boolean;
  tab: boolean;
  backspace: boolean;
  delete: boolean;
  meta: boolean;
};
export type InputHandler = (input: string, key: Key) => void;
/** Keyboard input hook — delegates to Ink's useInput */
export declare function useInput(
  handler: InputHandler,
  options?: {
    isActive?: boolean;
  }
): void;
//# sourceMappingURL=useInput.d.ts.map
