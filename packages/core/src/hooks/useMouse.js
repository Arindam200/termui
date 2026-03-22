import { useEffect, useRef } from 'react';
/**
 * Mouse events hook (click, scroll, drag).
 * Requires terminal to support xterm mouse protocol.
 * Enables mouse tracking on mount, disables on unmount.
 */
export function useMouse(handler) {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;
    useEffect(() => {
        if (!process.stdout.isTTY)
            return;
        // Enable xterm mouse protocol (button + any event tracking)
        process.stdout.write('\x1b[?1000h'); // basic mouse
        process.stdout.write('\x1b[?1002h'); // button event tracking
        process.stdout.write('\x1b[?1006h'); // SGR extended coordinates
        const rawHandler = (data) => {
            const str = data.toString();
            // Parse SGR mouse sequence: \x1b[<Cb;Cx;CyM or m
            const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
            if (!match)
                return;
            const cb = parseInt(match[1], 10);
            const x = parseInt(match[2], 10);
            const y = parseInt(match[3], 10);
            const released = match[4] === 'm';
            const ctrl = Boolean(cb & 16);
            const meta = Boolean(cb & 8);
            const shift = Boolean(cb & 4);
            const buttonCode = cb & 3;
            let button;
            if (cb & 64) {
                button = buttonCode === 0 ? 'scrollUp' : 'scrollDown';
            }
            else {
                button = ['left', 'middle', 'right'][buttonCode] ?? 'left';
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
//# sourceMappingURL=useMouse.js.map