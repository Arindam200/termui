import { useState, useEffect, useCallback, useRef } from 'react';

export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

/**
 * Manage async data loading with loading/error/data states.
 *
 * Re-runs the async function when `deps` change (same semantics as `useEffect`).
 * Returns `{ data, loading, error }` — exactly one of `data` or `error` will be
 * non-null after the promise settles. Stale requests (superseded by a newer
 * `deps` change) are automatically cancelled via a mounted ref guard.
 *
 * @param fn - Async factory that returns the data. Called on mount and
 *   whenever `deps` change.
 * @param deps - Dependency array (same as React `useEffect` deps).
 * @returns `AsyncState<T>` — `{ status, data, error, refetch }`.
 *
 * @example
 * ```tsx
 * const { data, status, error } = useAsync(() => fetchPackages(), [query]);
 * if (status === 'loading') return <Spinner />;
 * if (status === 'error') return <Alert variant="error">{error.message}</Alert>;
 * return <Table data={data} />;
 * ```
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
        setState({
          status: 'error',
          data: null,
          error: e instanceof Error ? e : new Error(String(e)),
        });
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
