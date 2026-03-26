import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock dynamic imports ─────────────────────────────────────────────────────

vi.mock('latest-version', () => ({
  default: vi.fn(),
}));

vi.mock('semver', () => ({
  default: {
    gt: vi.fn((a: string, b: string) => {
      const [aMaj, aMin, aPat] = a.split('.').map(Number);
      const [bMaj, bMin, bPat] = b.split('.').map(Number);
      if (aMaj! > bMaj!) return true;
      if (aMaj! < bMaj!) return false;
      if (aMin! > bMin!) return true;
      if (aMin! < bMin!) return false;
      return aPat! > bPat!;
    }),
  },
}));

import { checkPackageUpdate } from './index.js';
import latestVersion from 'latest-version';
import semver from 'semver';

const mockLatestVersion = latestVersion as ReturnType<typeof vi.fn>;
const mockGt = semver.gt as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkPackageUpdate', () => {
  it('is exported as a function', () => {
    expect(typeof checkPackageUpdate).toBe('function');
  });

  it('returns { current, latest, updateAvailable } shape', async () => {
    mockLatestVersion.mockResolvedValue('2.0.0');
    const result = await checkPackageUpdate('my-pkg', '1.0.0');
    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('latest');
    expect(result).toHaveProperty('updateAvailable');
  });

  it('preserves current version in result', async () => {
    mockLatestVersion.mockResolvedValue('1.0.0');
    const result = await checkPackageUpdate('my-pkg', '1.0.0');
    expect(result.current).toBe('1.0.0');
  });

  it('returns updateAvailable: false when latest is null (pkg not found)', async () => {
    mockLatestVersion.mockRejectedValue(new Error('not found'));
    const result = await checkPackageUpdate('unknown-pkg', '1.0.0');
    expect(result.latest).toBeNull();
    expect(result.updateAvailable).toBe(false);
  });

  it('returns updateAvailable: true when latest > current', async () => {
    mockLatestVersion.mockResolvedValue('2.0.0');
    mockGt.mockReturnValue(true);
    const result = await checkPackageUpdate('my-pkg', '1.0.0');
    expect(result.latest).toBe('2.0.0');
    expect(result.updateAvailable).toBe(true);
  });

  it('returns updateAvailable: false when latest === current', async () => {
    mockLatestVersion.mockResolvedValue('1.0.0');
    mockGt.mockReturnValue(false);
    const result = await checkPackageUpdate('my-pkg', '1.0.0');
    expect(result.updateAvailable).toBe(false);
  });

  it('returns updateAvailable: false when current is newer than latest', async () => {
    mockLatestVersion.mockResolvedValue('0.9.0');
    mockGt.mockReturnValue(false);
    const result = await checkPackageUpdate('my-pkg', '1.0.0');
    expect(result.updateAvailable).toBe(false);
  });

  it('handles semver module not installed gracefully', async () => {
    mockLatestVersion.mockResolvedValue('2.0.0');
    // Simulate semver throwing (package not installed)
    mockGt.mockImplementation(() => {
      throw new Error('Cannot find module semver');
    });
    // checkPackageUpdate catches semver errors and returns updateAvailable: false
    const result = await checkPackageUpdate('my-pkg', '1.0.0');
    expect(result.current).toBe('1.0.0');
    expect(result.updateAvailable).toBe(false);
  });
});
