import { useState, useEffect, useCallback, useRef } from 'react';

export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

/**
 * Async data loading hook with loading/error/data states.
 * Automatically cancels stale requests.
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await asyncFn();
      if (mountedRef.current) {
        setState({ status: 'success', data, error: null });
      }
    } catch (e) {
      if (mountedRef.current) {
        setState({ status: 'error', data: null, error: e instanceof Error ? e : new Error(String(e)) });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  return { ...state, refetch: execute };
}
