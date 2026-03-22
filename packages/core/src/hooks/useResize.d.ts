export interface TerminalSize {
    columns: number;
    rows: number;
}
/** Returns terminal dimensions, updates on resize with debounce */
export declare function useResize(debounceMs?: number): TerminalSize;
//# sourceMappingURL=useResize.d.ts.map