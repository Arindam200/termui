import {
  fgHex,
  bgHex,
  bold,
  dim,
  italic,
  underline,
  strikethrough,
  reset,
} from '../terminal/ansi.js';

type BorderStyle = 'single' | 'double' | 'round' | 'bold' | 'classic';

/**
 * Chainable style builder for ANSI-styled strings.
 *
 * Usage:
 *   style('Hello').bold().fg('#FF0000').build()
 *   style('World').dim().underline().build()
 */
export class StyleBuilder {
  private _text: string;
  private _codes: string[] = [];

  constructor(text: string) {
    this._text = text;
  }

  bold(): this {
    this._codes.push(bold);
    return this;
  }

  dim(): this {
    this._codes.push(dim);
    return this;
  }

  italic(): this {
    this._codes.push(italic);
    return this;
  }

  underline(): this {
    this._codes.push(underline);
    return this;
  }

  strikethrough(): this {
    this._codes.push(strikethrough);
    return this;
  }

  fg(color: string): this {
    this._codes.push(fgHex(color));
    return this;
  }

  bg(color: string): this {
    this._codes.push(bgHex(color));
    return this;
  }

  /** Build the final ANSI-styled string */
  build(): string {
    if (this._codes.length === 0) return this._text;
    return `${this._codes.join('')}${this._text}${reset}`;
  }

  toString(): string {
    return this.build();
  }
}

/** Entry point: style('text').bold().fg('#fff').build() */
export function style(text: string): StyleBuilder {
  return new StyleBuilder(text);
}
