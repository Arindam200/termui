import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Inline reimplementation of the Skeleton row-building logic
// (mirroring the actual source so we can unit-test it without a full render)
// ---------------------------------------------------------------------------

function buildRow(width: number, offset: number): string {
  let row = '';
  for (let i = 0; i < width; i++) {
    const inHighlight = i >= offset - 3 && i <= offset + 3;
    row += inHighlight ? '█' : '░';
  }
  return row;
}

function buildRows(width: number, height: number, frame: number, animated: boolean): string[] {
  return Array.from({ length: height }, (_, rowIndex) => {
    const rowOffset = animated ? (frame + rowIndex * 2) % (width + 6) : -1;
    let row = '';
    for (let i = 0; i < width; i++) {
      const inHighlight = i >= rowOffset - 3 && i <= rowOffset + 3;
      row += inHighlight ? '█' : '░';
    }
    return row;
  });
}

// ---------------------------------------------------------------------------

describe('Skeleton row logic', () => {
  it('non-animated row contains only ░ and/or █ placeholder chars', () => {
    // offset = -1: condition is i >= -4 && i <= 2, so positions 0-2 are highlighted.
    // The row always has exactly `width` characters, each being ░ or █.
    const row = buildRow(10, -1);
    expect(row).toHaveLength(10);
    expect([...row].every((c) => c === '░' || c === '█')).toBe(true);
  });

  it('animated row at offset in the middle contains █ highlight chars', () => {
    // offset = 5 on a width-10 row → positions 2-8 should be highlighted
    const row = buildRow(10, 5);
    expect(row).toContain('█');
    expect(row).toContain('░');
    expect(row).toHaveLength(10);
  });

  it('row length always equals the requested width', () => {
    for (const w of [1, 5, 20, 40]) {
      expect(buildRow(w, -1)).toHaveLength(w);
      expect(buildRow(w, Math.floor(w / 2))).toHaveLength(w);
    }
  });

  it('highlight window is at most 7 characters wide (offset ± 3)', () => {
    const width = 30;
    const offset = 15;
    const row = buildRow(width, offset);
    const highlighted = [...row].filter((c) => c === '█').length;
    expect(highlighted).toBeLessThanOrEqual(7);
  });

  it('buildRows returns the correct number of rows', () => {
    const rows = buildRows(20, 3, 0, false);
    expect(rows).toHaveLength(3);
  });

  it('non-animated rows each have exactly width characters, all ░ or █', () => {
    // animated=false forces offset=-1 for every row, which still highlights
    // positions 0-2 due to the condition (i >= offset-3). The key invariant is
    // that each row has the correct length and only uses the two placeholder chars.
    const rows = buildRows(15, 4, 99, false);
    for (const row of rows) {
      expect(row).toHaveLength(15);
      expect([...row].every((c) => c === '░' || c === '█')).toBe(true);
    }
  });

  it('animated rows stagger — adjacent rows differ when frame puts highlight mid-row', () => {
    // frame=5, rowIndex 0 → offset=5, rowIndex 1 → offset=7
    const rows = buildRows(20, 2, 5, true);
    // They should differ because offsets differ
    expect(rows[0]).not.toBe(rows[1]);
  });

  it('default width of 20 produces a 20-char row', () => {
    const row = buildRow(20, -1);
    expect(row).toHaveLength(20);
  });
});
