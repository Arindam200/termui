import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from '@termui/core';

export interface DataGridColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render?: (value: unknown, row: T) => string;
  filterable?: boolean;
  sortable?: boolean;
}

export interface DataGridProps<T extends Record<string, unknown> = Record<string, unknown>> {
  data: T[];
  columns: DataGridColumn<T>[];
  pageSize?: number;
  onRowSelect?: (row: T) => void;
  onCellEdit?: (row: T, key: string, value: string) => void;
  borderColor?: string;
  borderStyle?: 'single' | 'double' | 'round' | 'bold';
  showRowNumbers?: boolean;
  filterPlaceholder?: string;
  /** Default sort applied on first render (uncontrolled) */
  defaultSort?: { column: string; direction: 'asc' | 'desc' };
  /**
   * Controlled sort callback. When provided the component will NOT sort
   * internally — it just calls this handler and expects the consumer to
   * supply already-sorted `data`.
   */
  onSort?: (column: string, direction: 'asc' | 'desc' | null) => void;
  /** Column keys that are always rendered first (left-pinned). */
  pinnedColumns?: string[];
}

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

function DataGridComponent<T extends Record<string, unknown> = Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  onRowSelect,
  borderColor,
  borderStyle = 'single',
  showRowNumbers = false,
  defaultSort,
  onSort,
  pinnedColumns = [],
}: DataGridProps<T>) {
  const theme = useTheme();

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: 'asc' | 'desc' | null;
  }>(() => ({
    column: defaultSort?.column ?? null,
    direction: defaultSort?.direction ?? null,
  }));

  // ── Header focus (for `s` key cycling) ────────────────────────────────────
  // Index into the *displayed* columns array (after pinning reorder).
  const [headerFocusIdx, setHeaderFocusIdx] = useState<number | null>(null);
  const [headerMode, setHeaderMode] = useState(false); // true when navigating headers

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedRow, setSelectedRow] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [filterMode, setFilterMode] = useState(false);

  const resolvedBorderColor = borderColor ?? theme.colors.border;

  // ── Column ordering: pinned first ─────────────────────────────────────────
  const orderedColumns = useMemo(() => {
    if (pinnedColumns.length === 0) return columns;
    const pinned = pinnedColumns
      .map((key) => columns.find((c) => c.key === key))
      .filter((c): c is DataGridColumn<T> => c !== undefined);
    const rest = columns.filter((c) => !pinnedColumns.includes(c.key));
    return [...pinned, ...rest];
  }, [columns, pinnedColumns]);

  const pinnedCount = useMemo(
    () => orderedColumns.filter((c) => pinnedColumns.includes(c.key)).length,
    [orderedColumns, pinnedColumns]
  );

  // ── Column widths ─────────────────────────────────────────────────────────
  const colWidths = useMemo(
    () =>
      orderedColumns.map((col) => {
        if (col.width) return col.width;
        // Account for sort indicator (` ↑` or ` ↓`) — reserve 2 extra chars
        const headerLen = col.header.length + (col.sortable ? 2 : 0);
        const dataLen = Math.max(...data.map((row) => String(row[col.key] ?? '').length));
        return Math.max(headerLen, dataLen, 6);
      }),
    [orderedColumns, data]
  );

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!filter) return data;
    const q = filter.toLowerCase();
    return data.filter((row) =>
      orderedColumns.some((col) =>
        String(row[col.key] ?? '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, filter, orderedColumns]);

  // ── Sort (client-side only when onSort is not provided) ───────────────────
  const sorted = useMemo(() => {
    // Controlled mode — consumer handles sorting
    if (onSort) return filtered;

    if (!sortState.column || !sortState.direction) return filtered;

    const key = sortState.column;
    const dir = sortState.direction;

    return [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];

      // Numeric comparison
      if (typeof av === 'number' && typeof bv === 'number') {
        return dir === 'asc' ? av - bv : bv - av;
      }

      // String / mixed comparison
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''));
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortState, onSort]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const cycleSort = useCallback(
    (colKey: string, isSortable: boolean) => {
      if (!isSortable) return;

      setSortState((prev) => {
        let next: { column: string | null; direction: 'asc' | 'desc' | null };

        if (prev.column !== colKey) {
          next = { column: colKey, direction: 'asc' };
        } else if (prev.direction === 'asc') {
          next = { column: colKey, direction: 'desc' };
        } else {
          next = { column: null, direction: null };
        }

        if (onSort) {
          onSort(next.column ?? colKey, next.direction);
        }

        return next;
      });
    },
    [onSort]
  );

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useInput((input, key) => {
    // Filter mode
    if (filterMode) {
      if (key.escape) {
        setFilterMode(false);
      } else if (key.return) {
        setFilterMode(false);
      } else if (key.backspace || key.delete) {
        setFilter((f) => f.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setFilter((f) => f + input);
      }
      return;
    }

    // Header focus mode — navigating sortable column headers
    if (headerMode) {
      if (key.escape) {
        setHeaderMode(false);
        setHeaderFocusIdx(null);
        return;
      }
      if (key.leftArrow) {
        setHeaderFocusIdx((i) => Math.max(0, (i ?? 0) - 1));
        return;
      }
      if (key.rightArrow) {
        setHeaderFocusIdx((i) => Math.min(orderedColumns.length - 1, (i ?? 0) + 1));
        return;
      }
      if (input === 's') {
        const idx = headerFocusIdx ?? 0;
        const col = orderedColumns[idx];
        if (col) cycleSort(col.key, col.sortable ?? false);
        return;
      }
      if (key.return) {
        const idx = headerFocusIdx ?? 0;
        const col = orderedColumns[idx];
        if (col) cycleSort(col.key, col.sortable ?? false);
        setHeaderMode(false);
        setHeaderFocusIdx(null);
        return;
      }
    }

    // Normal row navigation
    if (key.upArrow) {
      setSelectedRow((r) => Math.max(0, r - 1));
    } else if (key.downArrow) {
      setSelectedRow((r) => Math.min(pageData.length - 1, r + 1));
    } else if (key.return || input === ' ') {
      if (pageData[selectedRow]) onRowSelect?.(pageData[selectedRow]);
    } else if (key.pageDown || input === 'n') {
      setPage((p) => Math.min(totalPages - 1, p + 1));
      setSelectedRow(0);
    } else if (key.pageUp || input === 'p') {
      setPage((p) => Math.max(0, p - 1));
      setSelectedRow(0);
    } else if (input === '/') {
      setFilterMode(true);
    } else if (input === 's') {
      // Enter header navigation mode; start at first sortable column
      const firstSortableIdx = orderedColumns.findIndex((c) => c.sortable);
      if (firstSortableIdx >= 0) {
        setHeaderMode(true);
        setHeaderFocusIdx(firstSortableIdx);
      }
    }
  });

  // ── Separator constant ────────────────────────────────────────────────────
  const colSep = ' │ ';
  const pinSep = ' ║ '; // visual separator between pinned and scrollable sections

  // ── Render helpers ────────────────────────────────────────────────────────
  function buildCells(getCell: (col: DataGridColumn<T>, ci: number) => string): string {
    if (pinnedCount === 0 || pinnedCount >= orderedColumns.length) {
      return orderedColumns.map((col, ci) => getCell(col, ci)).join(colSep);
    }
    const pinnedPart = orderedColumns
      .slice(0, pinnedCount)
      .map((col, ci) => getCell(col, ci))
      .join(colSep);
    const restPart = orderedColumns
      .slice(pinnedCount)
      .map((col, ci) => getCell(col, ci + pinnedCount))
      .join(colSep);
    return pinnedPart + pinSep + restPart;
  }

  const headerCells = buildCells((col, ci) => {
    const isSorted = sortState.column === col.key;
    const indicator = isSorted ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : '';
    const isFocused = headerMode && headerFocusIdx === ci;
    const label = col.header + indicator;
    const padded = pad(label, colWidths[ci], col.align);
    // Wrap focused header in brackets to signal focus
    return isFocused ? `[${padded}]` : padded;
  });

  const rowNumHeader = showRowNumbers ? '    ' : '';

  function renderRow(row: T, rowIdx: number, isSelected: boolean) {
    const cells = buildCells((col, ci) => {
      const raw = col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '');
      return pad(raw, colWidths[ci], col.align);
    });

    const rowNumStr = showRowNumbers ? String(page * pageSize + rowIdx + 1).padStart(3) + ' ' : '';

    return (
      <Box key={rowIdx} flexDirection="row">
        {rowNumStr && <Text dimColor>{rowNumStr}</Text>}
        <Text
          backgroundColor={isSelected ? theme.colors.primary : undefined}
          color={isSelected ? theme.colors.background : undefined}
        >
          {cells}
        </Text>
      </Box>
    );
  }

  // ── Hints ─────────────────────────────────────────────────────────────────
  const hasSortable = orderedColumns.some((c) => c.sortable);
  const sortHint = hasSortable ? '  s sort' : '';
  const headerModeHint = headerMode ? '  ←→ col  s cycle  Esc done' : '';

  return (
    <Box flexDirection="column">
      {/* Filter bar */}
      {(filterMode || filter) && (
        <Box flexDirection="row" marginBottom={1}>
          <Text color={theme.colors.primary}>{'Filter: '}</Text>
          <Text>{filter}</Text>
          {filterMode && <Text color={theme.colors.focusRing}>{'█'}</Text>}
        </Box>
      )}

      {/* Header mode hint */}
      {headerMode && (
        <Box marginBottom={1}>
          <Text color={theme.colors.primary}>{headerModeHint}</Text>
        </Box>
      )}

      <Box borderStyle={borderStyle} borderColor={resolvedBorderColor} flexDirection="column">
        {/* Header */}
        <Box flexDirection="row" paddingX={1}>
          {rowNumHeader && <Text dimColor>{rowNumHeader}</Text>}
          <Text bold color={headerMode ? theme.colors.focusRing : theme.colors.primary}>
            {headerCells}
          </Text>
        </Box>
        <Text color={resolvedBorderColor}>{'─'.repeat(headerCells.length + 2)}</Text>

        {/* Rows */}
        {pageData.length > 0 ? (
          pageData.map((row, i) => (
            <Box key={i} paddingX={1}>
              {renderRow(row, i, i === selectedRow)}
            </Box>
          ))
        ) : (
          <Box paddingX={1}>
            <Text dimColor>No data</Text>
          </Box>
        )}
      </Box>

      {/* Pagination + hints */}
      <Box flexDirection="row" gap={2} marginTop={1}>
        <Text dimColor>
          {'Page ' + (page + 1) + '/' + totalPages + ' (' + sorted.length + ' rows)'}
        </Text>
        {sortState.column && (
          <Text dimColor>
            {'sorted: ' + sortState.column + ' ' + (sortState.direction === 'asc' ? '↑' : '↓')}
          </Text>
        )}
        <Text dimColor>{'↑↓ navigate  n/p page  / filter' + sortHint + '  Enter select'}</Text>
      </Box>
    </Box>
  );
}

export const DataGrid = React.memo(DataGridComponent) as <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  props: DataGridProps<T>
) => React.ReactElement;
