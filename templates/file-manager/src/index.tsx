/**
 * TermUI Template — File Manager
 *
 * Two-panel file manager (commander-style):
 * Left panel — directory tree browser
 * Right panel — file preview / metadata
 *
 * Run: npx tsx src/index.tsx [path]
 */
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { ThemeProvider, useTheme, useAsync } from '@termui/core';
import {
  Spinner,
  Badge,
  Panel,
  Stack,
  Divider,
  KeyValue,
  StatusMessage,
  Tabs,
} from '@termui/components';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FsEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  mtime: Date;
  ext: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}M`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}G`;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const EXT_ICON: Record<string, string> = {
  '.ts': '📄', '.tsx': '⚛️ ', '.js': '📄', '.jsx': '⚛️ ',
  '.json': '{}', '.md': '📝', '.txt': '📄',
  '.png': '🖼 ', '.jpg': '🖼 ', '.gif': '🖼 ', '.svg': '🎨',
  '.zip': '📦', '.tar': '📦', '.gz': '📦',
  '.sh': '⚙️ ', '.env': '🔑',
};

function fileIcon(entry: FsEntry): string {
  if (entry.isDir) return '📁';
  return EXT_ICON[entry.ext] ?? '📄';
}

const TEXT_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.env', '.sh', '.yml', '.yaml', '.toml', '.css', '.html']);

// ─── Directory reader ─────────────────────────────────────────────────────────

async function readDir(path: string): Promise<FsEntry[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const results: FsEntry[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // skip dotfiles (remove if you want to show them)
    const fullPath = join(path, entry.name);
    try {
      const info = await stat(fullPath);
      results.push({
        name: entry.name,
        path: fullPath,
        isDir: entry.isDirectory(),
        size: info.size,
        mtime: info.mtime,
        ext: extname(entry.name).toLowerCase(),
      });
    } catch {
      // skip unreadable entries
    }
  }
  // Dirs first, then files, both alphabetical
  return results.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ─── Left panel — file list ───────────────────────────────────────────────────

function FileList({
  entries,
  selectedIndex,
  loading,
  cwd,
}: {
  entries: FsEntry[];
  selectedIndex: number;
  loading: boolean;
  cwd: string;
}) {
  const theme = useTheme();
  const visibleCount = 20;
  const scrollOffset = Math.max(0, selectedIndex - visibleCount + 3);
  const visible = entries.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <Box flexDirection="column" width={40} borderStyle="round" borderColor={theme.colors.border} paddingX={1}>
      <Text bold color={theme.colors.primary}>{basename(cwd) || cwd}</Text>
      <Text dimColor>{cwd}</Text>
      <Divider />
      {loading && (
        <Box gap={1}><Spinner style="dots" /><Text dimColor>Loading…</Text></Box>
      )}
      {!loading && entries.length === 0 && (
        <Text dimColor>(empty directory)</Text>
      )}
      {!loading && visible.map((entry, i) => {
        const absoluteIdx = i + scrollOffset;
        const isSelected = absoluteIdx === selectedIndex;
        return (
          <Box key={entry.path} gap={1}>
            <Text color={isSelected ? theme.colors.primary : 'inherit'}>
              {isSelected ? '▶' : ' '}
            </Text>
            <Text>{fileIcon(entry)}</Text>
            <Text
              bold={isSelected}
              color={
                isSelected
                  ? theme.colors.primary
                  : entry.isDir
                    ? theme.colors.accent
                    : theme.colors.foreground
              }
            >
              {entry.name.length > 24 ? entry.name.slice(0, 23) + '…' : entry.name}
            </Text>
            {!entry.isDir && (
              <Text dimColor>{formatSize(entry.size)}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Right panel — preview ────────────────────────────────────────────────────

function FilePreview({ entry }: { entry: FsEntry | null }) {
  const theme = useTheme();
  const [preview, setPreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!entry || entry.isDir) { setPreview(null); return; }
    if (!TEXT_EXTS.has(entry.ext)) { setPreview(null); return; }
    if (entry.size > 50 * 1024) { setPreview('(file too large to preview)'); return; }

    setPreviewLoading(true);
    import('fs').then(({ readFileSync }) => {
      try {
        const content = readFileSync(entry.path, 'utf-8');
        setPreview(content.slice(0, 2000));
      } catch {
        setPreview('(cannot read file)');
      } finally {
        setPreviewLoading(false);
      }
    });
  }, [entry?.path]);

  if (!entry) {
    return (
      <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor={theme.colors.border} paddingX={1}>
        <Text dimColor>No file selected</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor={theme.colors.border} paddingX={1}>
      <Text bold color={theme.colors.primary}>{fileIcon(entry)} {entry.name}</Text>
      <Divider />

      <KeyValue items={[
        { key: 'Type', value: entry.isDir ? 'Directory' : entry.ext || 'File' },
        { key: 'Size', value: entry.isDir ? '—' : formatSize(entry.size) },
        { key: 'Modified', value: formatDate(entry.mtime) },
        { key: 'Path', value: entry.path.length > 35 ? '…' + entry.path.slice(-34) : entry.path },
      ]} />

      {!entry.isDir && (
        <>
          <Divider label="Preview" />
          {previewLoading && <Box gap={1}><Spinner style="dots" /><Text dimColor>Loading…</Text></Box>}
          {!previewLoading && preview && (
            <Box flexDirection="column">
              {preview.split('\n').slice(0, 16).map((line, i) => (
                <Box key={i} gap={1}>
                  <Text dimColor>{String(i + 1).padStart(3)}</Text>
                  <Text>{line.slice(0, 60)}{line.length > 60 ? '…' : ''}</Text>
                </Box>
              ))}
            </Box>
          )}
          {!previewLoading && !preview && (
            <Text dimColor>(binary or unsupported format)</Text>
          )}
        </>
      )}
    </Box>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function FileManager() {
  const theme = useTheme();
  const { exit } = useApp();

  const startPath = process.argv[2] ?? process.cwd();
  const [cwd, setCwd] = useState(startPath);
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState('');

  // Load directory
  useEffect(() => {
    setLoading(true);
    setSelectedIndex(0);
    readDir(cwd)
      .then((e) => { setEntries(e); setLoading(false); })
      .catch(() => { setEntries([]); setLoading(false); setMessage('Cannot read directory'); });
  }, [cwd]);

  const selected = entries[selectedIndex] ?? null;

  useInput((_i, key) => {
    if (key.escape || _i === 'q') exit();

    if (key.upArrow || _i === 'k') {
      setSelectedIndex((i) => Math.max(0, i - 1));
    }
    if (key.downArrow || _i === 'j') {
      setSelectedIndex((i) => Math.min(entries.length - 1, i + 1));
    }
    if (key.return || key.rightArrow || _i === 'l') {
      if (selected?.isDir) setCwd(selected.path);
    }
    if (key.leftArrow || _i === 'h') {
      // Go up
      const parent = dirname(cwd);
      if (parent !== cwd) setCwd(parent);
    }
    if (_i === 'g') setSelectedIndex(0);
    if (_i === 'G') setSelectedIndex(entries.length - 1);
  });

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      {/* Header */}
      <Box justifyContent="space-between">
        <Text bold color={theme.colors.primary}>◆ File Manager</Text>
        <Text dimColor>↑↓/jk navigate  →/Enter open  ←/h back  q quit</Text>
      </Box>

      {message && <StatusMessage variant="error">{message}</StatusMessage>}

      {/* Panels */}
      <Box gap={1} flexGrow={1}>
        <FileList
          entries={entries}
          selectedIndex={selectedIndex}
          loading={loading}
          cwd={cwd}
        />
        <FilePreview entry={selected} />
      </Box>

      {/* Footer */}
      <Box justifyContent="space-between">
        <Text dimColor>
          {entries.length} items · {entries.filter((e) => e.isDir).length} dirs · {entries.filter((e) => !e.isDir).length} files
        </Text>
        <Text dimColor>g top · G bottom</Text>
      </Box>
    </Box>
  );
}

render(
  <ThemeProvider>
    <FileManager />
  </ThemeProvider>
);
