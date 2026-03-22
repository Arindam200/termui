/**
 * OSC 52 clipboard hook.
 * write() sends data to the terminal's clipboard via OSC 52.
 * Note: read() is not universally supported; returns null on unsupported terminals.
 */
export declare function useClipboard(): {
  write: (text: string) => void;
};
//# sourceMappingURL=useClipboard.d.ts.map
