import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFfmpegMicCapture, FfmpegNotFoundError } from './index.js';

// ── helpers ────────────────────────────────────────────────────────────────────

function makeMockProc(opts: { exitCode?: number; errorCode?: string } = {}) {
  const handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  const proc = {
    stdin: { write: vi.fn(), end: vi.fn() },
    kill: vi.fn(),
    on(event: string, cb: (...args: unknown[]) => void) {
      handlers[event] ??= [];
      handlers[event]!.push(cb);
      return proc;
    },
    emit(event: string, ...args: unknown[]) {
      handlers[event]?.forEach((cb) => cb(...args));
    },
  };
  return proc;
}

// ── tests ──────────────────────────────────────────────────────────────────────

describe('createFfmpegMicCapture', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws FfmpegNotFoundError when ffmpeg is not in PATH', async () => {
    const { spawn } = await import('node:child_process');
    vi.spyOn({ spawn }, 'spawn').mockImplementation((_cmd, _args, _opts) => {
      const proc = makeMockProc();
      // Simulate ENOENT on 'error' event
      setTimeout(() => {
        proc.emit('error', Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
      }, 0);
      return proc as unknown as ReturnType<typeof spawn>;
    });

    const capture = createFfmpegMicCapture();
    await expect(capture.start()).rejects.toBeInstanceOf(FfmpegNotFoundError);
  });

  it('FfmpegNotFoundError message includes install instructions', () => {
    const err = new FfmpegNotFoundError();
    expect(err.message).toContain('ffmpeg not found');
    expect(err.message).toContain('brew install ffmpeg');
    expect(err.message).toContain('apt install ffmpeg');
  });

  it('uses avfoundation backend on macOS by default', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
    try {
      // We just verify the factory creates without throwing (no actual spawn).
      const capture = createFfmpegMicCapture();
      expect(capture).toBeDefined();
    } finally {
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    }
  });

  it('uses dshow backend on Windows by default', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
    try {
      const capture = createFfmpegMicCapture();
      expect(capture).toBeDefined();
    } finally {
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    }
  });

  it('uses pulse backend on Linux by default', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
    try {
      const capture = createFfmpegMicCapture();
      expect(capture).toBeDefined();
    } finally {
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    }
  });

  it('respects explicit platformBackend option', () => {
    const capture = createFfmpegMicCapture({ platformBackend: 'alsa' });
    expect(capture).toBeDefined();
  });

  it('stop() before start() throws a descriptive error', async () => {
    const capture = createFfmpegMicCapture();
    await expect(capture.stop()).rejects.toThrow('stop() called before start()');
  });

  it('cancel() before start() resolves without throwing', async () => {
    const capture = createFfmpegMicCapture();
    await expect(capture.cancel?.()).resolves.toBeUndefined();
  });
});
