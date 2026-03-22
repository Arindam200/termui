export type AsyncState<T> = {
    status: 'idle';
    data: null;
    error: null;
} | {
    status: 'loading';
    data: null;
    error: null;
} | {
    status: 'success';
    data: T;
    error: null;
} | {
    status: 'error';
    data: null;
    error: Error;
};
/**
 * Async data loading hook with loading/error/data states.
 * Automatically cancels stale requests.
 */
export declare function useAsync<T>(asyncFn: () => Promise<T>, deps?: unknown[]): AsyncState<T> & {
    refetch: () => void;
};
//# sourceMappingURL=useAsync.d.ts.map