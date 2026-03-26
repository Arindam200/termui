import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock simple-git ──────────────────────────────────────────────────────────

const mockStatus = vi.fn();
const mockBranchLocal = vi.fn();
const mockRevparse = vi.fn();

vi.mock('simple-git', () => ({
  simpleGit: () => ({
    status: mockStatus,
    branchLocal: mockBranchLocal,
    revparse: mockRevparse,
  }),
}));

import { getGitBranches, getGitStatusShort, useGit } from './index.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('exports', () => {
  it('exports getGitBranches as a function', () => {
    expect(typeof getGitBranches).toBe('function');
  });

  it('exports getGitStatusShort as a function', () => {
    expect(typeof getGitStatusShort).toBe('function');
  });

  it('exports useGit as a function', () => {
    expect(typeof useGit).toBe('function');
  });
});

describe('getGitBranches', () => {
  it('returns all branch names', async () => {
    mockBranchLocal.mockResolvedValue({ all: ['main', 'dev', 'feature/x'] });
    const branches = await getGitBranches('/tmp/repo');
    expect(branches).toEqual(['main', 'dev', 'feature/x']);
  });

  it('returns empty array when no branches', async () => {
    mockBranchLocal.mockResolvedValue({ all: [] });
    const branches = await getGitBranches('/tmp/repo');
    expect(branches).toEqual([]);
  });

  it('propagates errors from simple-git', async () => {
    mockBranchLocal.mockRejectedValue(new Error('not a git repo'));
    await expect(getGitBranches('/tmp/not-a-repo')).rejects.toThrow('not a git repo');
  });
});

describe('getGitStatusShort', () => {
  const mockStatusResult = {
    current: 'main',
    ahead: 2,
    behind: 1,
    staged: ['a.ts', 'b.ts'],
    modified: ['c.ts'],
    created: [],
    deleted: ['d.ts'],
  };

  it('output contains all expected keys', async () => {
    mockStatus.mockResolvedValue(mockStatusResult);
    const result = await getGitStatusShort('/tmp/repo');
    expect(result).toContain('branch:');
    expect(result).toContain('ahead:');
    expect(result).toContain('behind:');
    expect(result).toContain('staged:');
    expect(result).toContain('modified:');
    expect(result).toContain('created:');
    expect(result).toContain('deleted:');
  });

  it('output contains correct values from status', async () => {
    mockStatus.mockResolvedValue(mockStatusResult);
    const result = await getGitStatusShort('/tmp/repo');
    expect(result).toContain('branch:main');
    expect(result).toContain('ahead:2');
    expect(result).toContain('behind:1');
    expect(result).toContain('staged:2');
    expect(result).toContain('modified:1');
    expect(result).toContain('created:0');
    expect(result).toContain('deleted:1');
  });

  it('zero counts render as 0', async () => {
    mockStatus.mockResolvedValue({
      current: 'dev',
      ahead: 0,
      behind: 0,
      staged: [],
      modified: [],
      created: [],
      deleted: [],
    });
    const result = await getGitStatusShort('/tmp/repo');
    expect(result).toContain('ahead:0');
    expect(result).toContain('staged:0');
    expect(result).toContain('modified:0');
  });

  it('propagates errors from simple-git', async () => {
    mockStatus.mockRejectedValue(new Error('permission denied'));
    await expect(getGitStatusShort('/tmp/repo')).rejects.toThrow('permission denied');
  });
});
