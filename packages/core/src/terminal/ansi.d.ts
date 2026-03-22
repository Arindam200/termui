/**
 * ANSI escape code utilities for terminal output.
 * Covers: colors, styles, cursor movement, screen control.
 */
export declare const reset = "\u001B[0m";
export declare const bold = "\u001B[1m";
export declare const dim = "\u001B[2m";
export declare const italic = "\u001B[3m";
export declare const underline = "\u001B[4m";
export declare const blink = "\u001B[5m";
export declare const inverse = "\u001B[7m";
export declare const hidden = "\u001B[8m";
export declare const strikethrough = "\u001B[9m";
export declare const fg: {
    readonly black: "\u001B[30m";
    readonly red: "\u001B[31m";
    readonly green: "\u001B[32m";
    readonly yellow: "\u001B[33m";
    readonly blue: "\u001B[34m";
    readonly magenta: "\u001B[35m";
    readonly cyan: "\u001B[36m";
    readonly white: "\u001B[37m";
    readonly default: "\u001B[39m";
    readonly brightBlack: "\u001B[90m";
    readonly brightRed: "\u001B[91m";
    readonly brightGreen: "\u001B[92m";
    readonly brightYellow: "\u001B[93m";
    readonly brightBlue: "\u001B[94m";
    readonly brightMagenta: "\u001B[95m";
    readonly brightCyan: "\u001B[96m";
    readonly brightWhite: "\u001B[97m";
};
export declare const bg: {
    readonly black: "\u001B[40m";
    readonly red: "\u001B[41m";
    readonly green: "\u001B[42m";
    readonly yellow: "\u001B[43m";
    readonly blue: "\u001B[44m";
    readonly magenta: "\u001B[45m";
    readonly cyan: "\u001B[46m";
    readonly white: "\u001B[47m";
    readonly default: "\u001B[49m";
    readonly brightBlack: "\u001B[100m";
    readonly brightRed: "\u001B[101m";
    readonly brightGreen: "\u001B[102m";
    readonly brightYellow: "\u001B[103m";
    readonly brightBlue: "\u001B[104m";
    readonly brightMagenta: "\u001B[105m";
    readonly brightCyan: "\u001B[106m";
    readonly brightWhite: "\u001B[107m";
};
/** 256-color foreground: \x1b[38;5;<n>m */
export declare function fg256(n: number): string;
/** 256-color background: \x1b[48;5;<n>m */
export declare function bg256(n: number): string;
/** True-color (24-bit) foreground: \x1b[38;2;<r>;<g>;<b>m */
export declare function fgRgb(r: number, g: number, b: number): string;
/** True-color (24-bit) background: \x1b[48;2;<r>;<g>;<b>m */
export declare function bgRgb(r: number, g: number, b: number): string;
/** Parse a hex color string (#RRGGBB or #RGB) into {r,g,b} */
export declare function parseHex(hex: string): {
    r: number;
    g: number;
    b: number;
};
/** Apply true-color foreground from a hex string */
export declare function fgHex(hex: string): string;
/** Apply true-color background from a hex string */
export declare function bgHex(hex: string): string;
export declare const cursor: {
    readonly up: (n?: number) => string;
    readonly down: (n?: number) => string;
    readonly forward: (n?: number) => string;
    readonly back: (n?: number) => string;
    readonly nextLine: (n?: number) => string;
    readonly prevLine: (n?: number) => string;
    readonly column: (n?: number) => string;
    readonly position: (row: number, col: number) => string;
    readonly hide: "\u001B[?25l";
    readonly show: "\u001B[?25h";
    readonly save: "\u001B[s";
    readonly restore: "\u001B[u";
};
export declare const screen: {
    readonly clear: "\u001B[2J";
    readonly clearToEnd: "\u001B[0J";
    readonly clearToStart: "\u001B[1J";
    readonly clearLine: "\u001B[2K";
    readonly clearLineToEnd: "\u001B[0K";
    readonly clearLineToStart: "\u001B[1K";
    readonly alternateBuffer: "\u001B[?1049h";
    readonly mainBuffer: "\u001B[?1049l";
};
export declare const osc: {
    /** OSC 8 — hyperlink: \x1b]8;;url\x1b\\ text \x1b]8;;\x1b\\ */
    readonly hyperlink: (url: string, text: string) => string;
    /** OSC 52 — clipboard write (base64-encoded) */
    readonly clipboardWrite: (data: string) => string;
    /** OSC 0 — set window title */
    readonly setTitle: (title: string) => string;
};
/** Wrap text with a style and reset */
export declare function style(code: string, text: string): string;
export declare function stripAnsi(str: string): string;
/** Measure visible width of a string (strips ANSI first) */
export declare function visibleWidth(str: string): number;
//# sourceMappingURL=ansi.d.ts.map