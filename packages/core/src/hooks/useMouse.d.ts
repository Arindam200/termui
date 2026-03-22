export type MouseButton = 'left' | 'middle' | 'right' | 'scrollUp' | 'scrollDown';
export interface MouseEvent {
  type: 'press' | 'release' | 'move';
  button: MouseButton;
  x: number;
  y: number;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
}
type MouseHandler = (event: MouseEvent) => void;
/**
 * Mouse events hook (click, scroll, drag).
 * Requires terminal to support xterm mouse protocol.
 * Enables mouse tracking on mount, disables on unmount.
 */
export declare function useMouse(handler: MouseHandler): void;
export {};
//# sourceMappingURL=useMouse.d.ts.map
