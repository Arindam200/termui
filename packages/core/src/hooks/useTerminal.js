import { useState, useEffect } from 'react';
import { getCapabilities, refreshCapabilities } from '../terminal/capabilities.js';
/** Returns current terminal capabilities, updates on resize */
export function useTerminal() {
    const [caps, setCaps] = useState(getCapabilities);
    useEffect(() => {
        const handler = () => {
            setCaps(refreshCapabilities());
        };
        process.stdout.on('resize', handler);
        return () => {
            process.stdout.off('resize', handler);
        };
    }, []);
    return caps;
}
//# sourceMappingURL=useTerminal.js.map