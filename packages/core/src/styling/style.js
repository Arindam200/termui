import { fgHex, bgHex, bold, dim, italic, underline, strikethrough, reset } from '../terminal/ansi.js';
/**
 * Chainable style builder for ANSI-styled strings.
 *
 * Usage:
 *   style('Hello').bold().fg('#FF0000').build()
 *   style('World').dim().underline().build()
 */
export class StyleBuilder {
    _text;
    _codes = [];
    constructor(text) {
        this._text = text;
    }
    bold() {
        this._codes.push(bold);
        return this;
    }
    dim() {
        this._codes.push(dim);
        return this;
    }
    italic() {
        this._codes.push(italic);
        return this;
    }
    underline() {
        this._codes.push(underline);
        return this;
    }
    strikethrough() {
        this._codes.push(strikethrough);
        return this;
    }
    fg(color) {
        this._codes.push(fgHex(color));
        return this;
    }
    bg(color) {
        this._codes.push(bgHex(color));
        return this;
    }
    /** Build the final ANSI-styled string */
    build() {
        if (this._codes.length === 0)
            return this._text;
        return `${this._codes.join('')}${this._text}${reset}`;
    }
    toString() {
        return this.build();
    }
}
/** Entry point: style('text').bold().fg('#fff').build() */
export function style(text) {
    return new StyleBuilder(text);
}
//# sourceMappingURL=style.js.map