import { useEffect, useRef } from 'react';
/**
 * React-safe setInterval hook with automatic cleanup.
 * The callback is always fresh (via ref) so stale closure is not an issue.
 */
export function useInterval(callback, delay) {
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        if (delay === null)
            return;
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}
//# sourceMappingURL=useInterval.js.map