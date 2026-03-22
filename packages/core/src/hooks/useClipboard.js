import { useCallback } from 'react';
import { osc } from '../terminal/ansi.js';
/**
 * OSC 52 clipboard hook.
 * write() sends data to the terminal's clipboard via OSC 52.
 * Note: read() is not universally supported; returns null on unsupported terminals.
 */
export function useClipboard() {
    const write = useCallback((text) => {
        process.stdout.write(osc.clipboardWrite(text));
    }, []);
    return { write };
}
//# sourceMappingURL=useClipboard.js.map