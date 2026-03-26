import { useEffect, useRef } from 'react';

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
 * Subscribe to terminal mouse events including clicks, releases, and scroll
 * wheel input. Enables the xterm SGR mouse protocol (`?1000h`, `?1002h`,
 * `?1006h`) on mount and cleanly disables it on unmount. Has no effect in
 * non-TTY environments (e.g. CI pipes).
 *
 * @param handler - Callback invoked for every mouse event. Receives a
 *   `MouseEvent` describing the interaction:
 *   - `type` — `'press'` on button-down, `'release'` on button-up.
 *   - `button` — Which button triggered the event: `'left'`, `'middle'`,
 *     `'right'`, `'scrollUp'`, or `'scrollDown'`.
 *   - `x` / `y` — 1-based terminal column and row of the cursor.
 *   - `ctrl` / `shift` / `meta` — Modifier key state at the time of the event.
 *   The handler reference is kept stable internally via a ref, so it is safe
 *   to pass an inline function without wrapping in `useCallback`.
 *
 * @example
 * ```tsx
 * function ClickableBox() {
 *   useMouse((event) => {
 *     if (event.type === 'press' && event.button === 'left') {
 *       console.log(`Left click at (${event.x}, ${event.y})`);
 *     }
 *     if (event.button === 'scrollUp') {
 *       setOffset((o) => Math.max(0, o - 1));
 *     }
 *     if (event.button === 'scrollDown') {
 *       setOffset((o) => o + 1);
 *     }
 *   });
 *
 *   return <Box><Text>Scroll or click me</Text></Box>;
 * }
 * ```
 */
export function useMouse(handler: MouseHandler): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!process.stdout.isTTY) return;

    // Enable xterm mouse protocol (button + any event tracking)
    process.stdout.write('\x1b[?1000h'); // basic mouse
    process.stdout.write('\x1b[?1002h'); // button event tracking
    process.stdout.write('\x1b[?1006h'); // SGR extended coordinates

    const rawHandler = (data: Buffer) => {
      const str = data.toString();
      // Parse SGR mouse sequence: \x1b[<Cb;Cx;CyM or m
      const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
      if (!match) return;

      const cb = parseInt(match[1], 10);
      const x = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);
      const released = match[4] === 'm';

      const ctrl = Boolean(cb & 16);
      const meta = Boolean(cb & 8);
      const shift = Boolean(cb & 4);
      const buttonCode = cb & 3;

      let button: MouseButton;
      if (cb & 64) {
        button = buttonCode === 0 ? 'scrollUp' : 'scrollDown';
      } else {
        button = (['left', 'middle', 'right'] as const)[buttonCode] ?? 'left';
      }

      handlerRef.current({
        type: released ? 'release' : 'press',
        button,
        x,
        y,
        ctrl,
        shift,
        meta,
      });
    };

    process.stdin.on('data', rawHandler);

    return () => {
      // Disable mouse tracking
      process.stdout.write('\x1b[?1000l');
      process.stdout.write('\x1b[?1002l');
      process.stdout.write('\x1b[?1006l');
      process.stdin.off('data', rawHandler);
    };
  }, []);
}
