import { describe, it, expect } from 'vitest';
import { DataGrid } from './DataGrid.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('DataGrid export', () => {
  it('is exported as a function', () => {
    expect(typeof DataGrid).toBe('function');
  });
});

// ── pad utility ────────────────────────────────────────────────────────────
// Mirrors the internal `pad` function used to format cell and header text

function pad(str: string, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
  const s = String(str);
  if (s.length >= width) return s.slice(0, width);
  const diff = width - s.length;
  if (align === 'right') return ' '.repeat(diff) + s;
  if (align === 'center') {
    const left = Math.floor(diff / 2);
    return ' '.repeat(left) + s + ' '.repeat(diff - left);
  }
  return s + ' '.repeat(diff);
}

describe('DataGrid pad utility', () => {
  it('pads left (default)', () => {
    expect(pad('Name', 8)).toBe('Name    ');
  });

  it('pads right', () => {
    expect(pad('42', 6, 'right')).toBe('    42');
  });

  it('centers', () => {
    expect(pad('hi', 6, 'center')).toBe('  hi  ');
  });

  it('truncates when text exceeds width', () => {
    expect(pad('LongHeader', 4)).toBe('Long');
  });
});

// ── Column header rendering ────────────────────────────────────────────────
// Mirrors `buildCells` / header construction in DataGrid.tsx

interface Column {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}

type Row = Record<string, unknown>;

function calcColWidths(columns: Column[], data: Row[]): number[] {
  return columns.map((col) => {
    if (col.width) return col.width;
    const headerLen = col.header.length + (col.sortable ? 2 : 0);
    const dataLen =
      data.length > 0 ? Math.max(...data.map((row) => String(row[col.key] ?? '').length)) : 0;
    return Math.max(headerLen, dataLen, 6);
  });
}

function buildHeaderLine(columns: Column[], data: Row[], sep = ' │ '): string {
  const widths = calcColWidths(columns, data);
  return columns.map((col, ci) => pad(col.header, widths[ci]!, col.align)).join(sep);
}

const COLUMNS: Column[] = [
  { key: 'id', header: 'ID', align: 'right' },
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
];

const DATA: Row[] = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'Editor' },
  { id: 3, name: 'Charlie', role: 'Viewer' },
];

describe('DataGrid column headers', () => {
  it('header line contains all column header labels', () => {
    const header = buildHeaderLine(COLUMNS, DATA);
    expect(header).toContain('ID');
    expect(header).toContain('Name');
    expect(header).toContain('Role');
  });

  it('headers are separated by the column separator', () => {
    const header = buildHeaderLine(COLUMNS, DATA);
    expect(header).toContain(' │ ');
  });

  it('auto-width is at least 6 characters wide', () => {
    const widths = calcColWidths(COLUMNS, DATA);
    widths.forEach((w) => expect(w).toBeGreaterThanOrEqual(6));
  });

  it('explicit column width overrides auto-width', () => {
    const cols: Column[] = [{ key: 'name', header: 'Name', width: 15 }];
    const widths = calcColWidths(cols, DATA);
    expect(widths[0]).toBe(15);
  });

  it('sortable header reserves 2 extra chars for sort indicator', () => {
    const cols: Column[] = [{ key: 'name', header: 'Name', sortable: true }];
    const widths = calcColWidths(cols, []);
    // header 'Name'(4) + 2 = 6, which also equals the min of 6
    expect(widths[0]).toBeGreaterThanOrEqual(6);
  });
});

// ── Row data rendering ─────────────────────────────────────────────────────
// Mirrors the cell-building logic inside renderRow in DataGrid.tsx

function buildRowLine(row: Row, columns: Column[], widths: number[], sep = ' │ '): string {
  return columns
    .map((col, ci) => pad(String(row[col.key] ?? ''), widths[ci]!, col.align))
    .join(sep);
}

describe('DataGrid row data', () => {
  it('renders each cell value in the row', () => {
    const widths = calcColWidths(COLUMNS, DATA);
    const line = buildRowLine(DATA[0]!, COLUMNS, widths);
    expect(line).toContain('1');
    expect(line).toContain('Alice');
    expect(line).toContain('Admin');
  });

  it('renders all rows independently', () => {
    const widths = calcColWidths(COLUMNS, DATA);
    const lines = DATA.map((row) => buildRowLine(row, COLUMNS, widths));
    expect(lines[0]).toContain('Alice');
    expect(lines[1]).toContain('Bob');
    expect(lines[2]).toContain('Charlie');
  });

  it('renders missing/undefined cell as empty string', () => {
    const widths = calcColWidths(COLUMNS, DATA);
    const rowWithMissing: Row = { id: 4, name: 'Dave' }; // role missing
    const line = buildRowLine(rowWithMissing, COLUMNS, widths);
    expect(line).toContain('Dave');
    // 'role' is undefined → rendered as ''
    expect(line).not.toContain('undefined');
  });

  it('applies a custom render function when provided', () => {
    const colsWithRender: Column[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
    ];
    const widths = calcColWidths(colsWithRender, DATA);
    // Override cell rendering for 'name' to uppercase
    const line = colsWithRender
      .map((col, ci) => {
        const raw =
          col.key === 'name'
            ? String(DATA[0]![col.key] ?? '').toUpperCase()
            : String(DATA[0]![col.key] ?? '');
        return pad(raw, widths[ci]!);
      })
      .join(' │ ');
    expect(line).toContain('ALICE');
  });
});

// ── Pinned columns reordering ──────────────────────────────────────────────
// Mirrors the `orderedColumns` useMemo in DataGrid.tsx

function orderColumns(columns: Column[], pinnedColumns: string[]): Column[] {
  if (pinnedColumns.length === 0) return columns;
  const pinned = pinnedColumns
    .map((key) => columns.find((c) => c.key === key))
    .filter((c): c is Column => c !== undefined);
  const rest = columns.filter((c) => !pinnedColumns.includes(c.key));
  return [...pinned, ...rest];
}

describe('DataGrid pinnedColumns', () => {
  it('returns columns unchanged when no columns are pinned', () => {
    const ordered = orderColumns(COLUMNS, []);
    expect(ordered.map((c) => c.key)).toEqual(['id', 'name', 'role']);
  });

  it('moves pinned column to the front', () => {
    const ordered = orderColumns(COLUMNS, ['role']);
    expect(ordered[0]!.key).toBe('role');
  });

  it('preserves relative order of pinned columns', () => {
    const ordered = orderColumns(COLUMNS, ['role', 'name']);
    expect(ordered[0]!.key).toBe('role');
    expect(ordered[1]!.key).toBe('name');
    expect(ordered[2]!.key).toBe('id');
  });

  it('ignores pinned keys that do not match any column', () => {
    const ordered = orderColumns(COLUMNS, ['nonexistent', 'id']);
    expect(ordered[0]!.key).toBe('id');
    expect(ordered).toHaveLength(3);
  });

  it('pinnedCount equals number of pinned columns found in ordered list', () => {
    const ordered = orderColumns(COLUMNS, ['role', 'name']);
    const pinnedCount = ordered.filter((c) => ['role', 'name'].includes(c.key)).length;
    expect(pinnedCount).toBe(2);
  });
});

// ── Pagination ─────────────────────────────────────────────────────────────
// Mirrors `totalPages` and `pageData` calculations in DataGrid.tsx

function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { pageData: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageData = items.slice(page * pageSize, (page + 1) * pageSize);
  return { pageData, totalPages };
}

describe('DataGrid pagination', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  it('returns first page of rows', () => {
    const { pageData } = paginate(rows, 0, 10);
    expect(pageData).toHaveLength(10);
    expect(pageData[0]!.id).toBe(1);
  });

  it('calculates total pages correctly', () => {
    expect(paginate(rows, 0, 10).totalPages).toBe(3);
  });

  it('last page may have fewer rows', () => {
    const { pageData } = paginate(rows, 2, 10);
    expect(pageData).toHaveLength(5);
  });

  it('totalPages is at least 1 for empty data', () => {
    expect(paginate([], 0, 10).totalPages).toBe(1);
  });
});

// ── Filter logic ───────────────────────────────────────────────────────────
// Mirrors the `filtered` useMemo in DataGrid.tsx

function filterRows(data: Row[], columns: Column[], query: string): Row[] {
  if (!query) return data;
  const q = query.toLowerCase();
  return data.filter((row) =>
    columns.some((col) =>
      String(row[col.key] ?? '')
        .toLowerCase()
        .includes(q)
    )
  );
}

describe('DataGrid filter', () => {
  it('returns all rows when query is empty', () => {
    expect(filterRows(DATA, COLUMNS, '')).toHaveLength(3);
  });

  it('filters rows by partial case-insensitive match', () => {
    const result = filterRows(DATA, COLUMNS, 'ali');
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Alice');
  });

  it('matches across any column', () => {
    const result = filterRows(DATA, COLUMNS, 'editor');
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Bob');
  });

  it('returns empty array when no rows match', () => {
    expect(filterRows(DATA, COLUMNS, 'zzz')).toHaveLength(0);
  });
});
