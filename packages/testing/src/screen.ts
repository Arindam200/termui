/**
 * Query helpers — inspired by @testing-library/dom but for terminal output.
 *
 * All queries operate on a plain string (stripped of ANSI codes).
 */

export interface ScreenQueries {
  /** Returns the first line containing the text, throws if not found */
  getByText(text: string | RegExp, output: string): string;
  /** Returns the first line containing the text, or null */
  queryByText(text: string | RegExp, output: string): string | null;
  /** Returns all lines containing the text */
  getAllByText(text: string | RegExp, output: string): string[];
  /** Returns true if any line contains the text */
  hasText(text: string | RegExp, output: string): boolean;
  /** Returns the number of lines containing the text */
  countByText(text: string | RegExp, output: string): number;
  /** Returns output split into trimmed non-empty lines */
  getLines(output: string): string[];
}

function matchLine(line: string, query: string | RegExp): boolean {
  return typeof query === 'string' ? line.includes(query) : query.test(line);
}

export const screen: ScreenQueries = {
  getLines(output: string): string[] {
    return output
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  },

  queryByText(text: string | RegExp, output: string): string | null {
    return screen.getLines(output).find((l) => matchLine(l, text)) ?? null;
  },

  getByText(text: string | RegExp, output: string): string {
    const found = screen.queryByText(text, output);
    if (!found) {
      throw new Error(
        `Unable to find element with text: ${text instanceof RegExp ? text.toString() : JSON.stringify(text)}\n\nReceived output:\n${output}`
      );
    }
    return found;
  },

  getAllByText(text: string | RegExp, output: string): string[] {
    return screen.getLines(output).filter((l) => matchLine(l, text));
  },

  hasText(text: string | RegExp, output: string): boolean {
    return screen.queryByText(text, output) !== null;
  },

  countByText(text: string | RegExp, output: string): number {
    return screen.getAllByText(text, output).length;
  },
};
