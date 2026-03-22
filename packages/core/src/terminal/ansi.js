/**
 * ANSI escape code utilities for terminal output.
 * Covers: colors, styles, cursor movement, screen control.
 */
// ESC character
const ESC = '\x1b';
// Reset
export const reset = `${ESC}[0m`;
// Text styles
export const bold = `${ESC}[1m`;
export const dim = `${ESC}[2m`;
export const italic = `${ESC}[3m`;
export const underline = `${ESC}[4m`;
export const blink = `${ESC}[5m`;
export const inverse = `${ESC}[7m`;
export const hidden = `${ESC}[8m`;
export const strikethrough = `${ESC}[9m`;
// Standard foreground colors (30–37)
export const fg = {
    black: `${ESC}[30m`,
    red: `${ESC}[31m`,
    green: `${ESC}[32m`,
    yellow: `${ESC}[33m`,
    blue: `${ESC}[34m`,
    magenta: `${ESC}[35m`,
    cyan: `${ESC}[36m`,
    white: `${ESC}[37m`,
    default: `${ESC}[39m`,
    // Bright variants (90–97)
    brightBlack: `${ESC}[90m`,
    brightRed: `${ESC}[91m`,
    brightGreen: `${ESC}[92m`,
    brightYellow: `${ESC}[93m`,
    brightBlue: `${ESC}[94m`,
    brightMagenta: `${ESC}[95m`,
    brightCyan: `${ESC}[96m`,
    brightWhite: `${ESC}[97m`,
};
// Standard background colors (40–47)
export const bg = {
    black: `${ESC}[40m`,
    red: `${ESC}[41m`,
    green: `${ESC}[42m`,
    yellow: `${ESC}[43m`,
    blue: `${ESC}[44m`,
    magenta: `${ESC}[45m`,
    cyan: `${ESC}[46m`,
    white: `${ESC}[47m`,
    default: `${ESC}[49m`,
    // Bright backgrounds
    brightBlack: `${ESC}[100m`,
    brightRed: `${ESC}[101m`,
    brightGreen: `${ESC}[102m`,
    brightYellow: `${ESC}[103m`,
    brightBlue: `${ESC}[104m`,
    brightMagenta: `${ESC}[105m`,
    brightCyan: `${ESC}[106m`,
    brightWhite: `${ESC}[107m`,
};
/** 256-color foreground: \x1b[38;5;<n>m */
export function fg256(n) {
    return `${ESC}[38;5;${n}m`;
}
/** 256-color background: \x1b[48;5;<n>m */
export function bg256(n) {
    return `${ESC}[48;5;${n}m`;
}
/** True-color (24-bit) foreground: \x1b[38;2;<r>;<g>;<b>m */
export function fgRgb(r, g, b) {
    return `${ESC}[38;2;${r};${g};${b}m`;
}
/** True-color (24-bit) background: \x1b[48;2;<r>;<g>;<b>m */
export function bgRgb(r, g, b) {
    return `${ESC}[48;2;${r};${g};${b}m`;
}
/** Parse a hex color string (#RRGGBB or #RGB) into {r,g,b} */
export function parseHex(hex) {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16);
        const g = parseInt(clean[1] + clean[1], 16);
        const b = parseInt(clean[2] + clean[2], 16);
        return { r, g, b };
    }
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
}
/** Apply true-color foreground from a hex string */
export function fgHex(hex) {
    const { r, g, b } = parseHex(hex);
    return fgRgb(r, g, b);
}
/** Apply true-color background from a hex string */
export function bgHex(hex) {
    const { r, g, b } = parseHex(hex);
    return bgRgb(r, g, b);
}
// Cursor movement
export const cursor = {
    up: (n = 1) => `${ESC}[${n}A`,
    down: (n = 1) => `${ESC}[${n}B`,
    forward: (n = 1) => `${ESC}[${n}C`,
    back: (n = 1) => `${ESC}[${n}D`,
    nextLine: (n = 1) => `${ESC}[${n}E`,
    prevLine: (n = 1) => `${ESC}[${n}F`,
    column: (n = 1) => `${ESC}[${n}G`,
    position: (row, col) => `${ESC}[${row};${col}H`,
    hide: `${ESC}[?25l`,
    show: `${ESC}[?25h`,
    save: `${ESC}[s`,
    restore: `${ESC}[u`,
};
// Screen control
export const screen = {
    clear: `${ESC}[2J`,
    clearToEnd: `${ESC}[0J`,
    clearToStart: `${ESC}[1J`,
    clearLine: `${ESC}[2K`,
    clearLineToEnd: `${ESC}[0K`,
    clearLineToStart: `${ESC}[1K`,
    alternateBuffer: `${ESC}[?1049h`,
    mainBuffer: `${ESC}[?1049l`,
};
// OSC (Operating System Command) sequences
export const osc = {
    /** OSC 8 — hyperlink: \x1b]8;;url\x1b\\ text \x1b]8;;\x1b\\ */
    hyperlink: (url, text) => `${ESC}]8;;${url}${ESC}\\${text}${ESC}]8;;${ESC}\\`,
    /** OSC 52 — clipboard write (base64-encoded) */
    clipboardWrite: (data) => {
        const encoded = Buffer.from(data).toString('base64');
        return `${ESC}]52;c;${encoded}\x07`;
    },
    /** OSC 0 — set window title */
    setTitle: (title) => `${ESC}]0;${title}\x07`,
};
/** Wrap text with a style and reset */
export function style(code, text) {
    return `${code}${text}${reset}`;
}
/** Strip all ANSI escape sequences from a string */
// We implement a fast inline stripper here;
// consumers should prefer the 'strip-ansi' package for full coverage
const ANSI_REGEX = /\x1b\[[0-9;]*[mGKHFABCDJn]|\x1b\][^\\]*\x1b\\|\x1b[()][AB012]/g;
export function stripAnsi(str) {
    return str.replace(ANSI_REGEX, '');
}
/** Measure visible width of a string (strips ANSI first) */
export function visibleWidth(str) {
    return stripAnsi(str).length;
}
//# sourceMappingURL=ansi.js.map