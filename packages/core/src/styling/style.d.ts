/**
 * Chainable style builder for ANSI-styled strings.
 *
 * Usage:
 *   style('Hello').bold().fg('#FF0000').build()
 *   style('World').dim().underline().build()
 */
export declare class StyleBuilder {
  private _text;
  private _codes;
  constructor(text: string);
  bold(): this;
  dim(): this;
  italic(): this;
  underline(): this;
  strikethrough(): this;
  fg(color: string): this;
  bg(color: string): this;
  /** Build the final ANSI-styled string */
  build(): string;
  toString(): string;
}
/** Entry point: style('text').bold().fg('#fff').build() */
export declare function style(text: string): StyleBuilder;
//# sourceMappingURL=style.d.ts.map
