import { useState, useEffect } from 'react';
/** Returns terminal dimensions, updates on resize with debounce */
export function useResize(debounceMs = 50) {
    const [size, setSize] = useState({
        columns: process.stdout.columns ?? 80,
        rows: process.stdout.rows ?? 24,
    });
    useEffect(() => {
        let timer;
        const handler = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                setSize({
                    columns: process.stdout.columns ?? 80,
                    rows: process.stdout.rows ?? 24,
                });
            }, debounceMs);
        };
        process.stdout.on('resize', handler);
        return () => {
            clearTimeout(timer);
            process.stdout.off('resize', handler);
        };
    }, [debounceMs]);
    return size;
}
//# sourceMappingURL=useResize.js.map