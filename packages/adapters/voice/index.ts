/**
 * termui/voice — ffmpeg-based microphone capture helper.
 *
 * Records to a temporary WAV file using `ffmpeg` found in PATH.
 * Behavior varies by platform and audio device availability; this helper
 * is best-effort and intentionally does not pretend to "just work everywhere".
 *
 * Requirements:
 *   - `ffmpeg` available in PATH
 *   - A working audio input device
 *
 * Platform backends:
 *   - macOS  → avfoundation (default when platformBackend is omitted on darwin)
 *   - Windows → dshow       (default when platformBackend is omitted on win32)
 *   - Linux   → pulse or alsa (default: pulse when platformBackend is omitted on linux)
 *
 * @example
 * ```ts
 * import { createFfmpegMicCapture } from 'termui/voice';
 * import OpenAI from 'openai';
 *
 * const openai = new OpenAI();
 *
 * <TextInput
 *   voice={{
 *     captureFactory: () => createFfmpegMicCapture(),
 *     transcribe: async (wav) => {
 *       const res = await openai.audio.transcriptions.create({
 *         file: new File([wav], 'audio.wav', { type: 'audio/wav' }),
 *         model: 'whisper-1',
 *       });
 *       return res.text;
 *     },
 *   }}
 * />
 * ```
 */

import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Minimal interface a capture backend must satisfy.
 * Structurally compatible with the `VoiceCapture` type from `termui`.
 */
export interface VoiceCapture {
  start(): void | Promise<void>;
  stop(): Promise<Buffer>;
  cancel?(): void | Promise<void>;
}

export type FfmpegPlatformBackend = 'avfoundation' | 'dshow' | 'alsa' | 'pulse';

export interface FfmpegMicCaptureOptions {
  /**
   * ffmpeg `-f` input format backend.
   * Defaults to `avfoundation` on macOS, `dshow` on Windows, `pulse` on Linux.
   */
  platformBackend?: FfmpegPlatformBackend;
  /**
   * Audio input device string passed to ffmpeg as `-i <device>`.
   * Defaults to `default` (pulse/alsa) or `:0` (avfoundation) or `audio=default` (dshow).
   */
  device?: string;
  /** Sample rate in Hz. Default: 16000. */
  sampleRate?: number;
}

function defaultBackend(): FfmpegPlatformBackend {
  if (process.platform === 'darwin') return 'avfoundation';
  if (process.platform === 'win32') return 'dshow';
  return 'pulse';
}

function defaultDevice(backend: FfmpegPlatformBackend): string {
  if (backend === 'avfoundation') return ':0';
  if (backend === 'dshow') return 'audio=default';
  return 'default';
}

/**
 * Creates a VoiceCapture backed by ffmpeg microphone recording.
 *
 * Call `start()` to begin recording, then `stop()` to finish and retrieve
 * the raw WAV bytes. Temp files are cleaned up automatically on success,
 * error, or cancellation.
 */
export function createFfmpegMicCapture(options: FfmpegMicCaptureOptions = {}): VoiceCapture {
  const backend = options.platformBackend ?? defaultBackend();
  const device = options.device ?? defaultDevice(backend);
  const sampleRate = options.sampleRate ?? 16000;

  const tmpPath = join(
    tmpdir(),
    `termui-voice-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`
  );

  let proc: ChildProcess | null = null;
  let started = false;

  async function cleanup() {
    try {
      await unlink(tmpPath);
    } catch {
      // ignore — file may not exist yet
    }
  }

  return {
    async start() {
      // Verify ffmpeg is accessible before spawning.
      await verifyFfmpeg();

      const args = [
        '-y',
        '-f',
        backend,
        '-i',
        device,
        '-ar',
        String(sampleRate),
        '-ac',
        '1',
        '-acodec',
        'pcm_s16le',
        tmpPath,
      ];

      proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
      started = true;

      proc.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'ENOENT') {
          throw new FfmpegNotFoundError();
        }
        throw err;
      });
    },

    async stop(): Promise<Buffer> {
      if (!proc || !started) {
        throw new Error('termui/voice: stop() called before start()');
      }

      await new Promise<void>((resolve, reject) => {
        proc!.on('close', resolve);
        proc!.on('error', reject);
        // Send 'q' to ffmpeg stdin to request a clean stop.
        proc!.stdin?.write('q');
        proc!.stdin?.end();
        // Fallback: send SIGINT if stdin is not available.
        if (!proc!.stdin) {
          proc!.kill('SIGINT');
        }
      });

      try {
        const bytes = await readFile(tmpPath);
        await cleanup();
        return bytes;
      } catch (err) {
        await cleanup();
        throw new Error(`termui/voice: failed to read recorded audio — ${String(err)}`);
      }
    },

    async cancel() {
      if (proc) {
        proc.kill('SIGKILL');
        proc = null;
      }
      await cleanup();
    },
  };
}

/** Thrown when `ffmpeg` is not found in PATH. */
export class FfmpegNotFoundError extends Error {
  constructor() {
    super(
      'termui/voice: ffmpeg not found in PATH.\n' +
        'Install ffmpeg to use voice dictation:\n' +
        '  macOS:  brew install ffmpeg\n' +
        '  Ubuntu: sudo apt install ffmpeg\n' +
        '  Windows: https://ffmpeg.org/download.html'
    );
    this.name = 'FfmpegNotFoundError';
  }
}

async function verifyFfmpeg(): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = spawn('ffmpeg', ['-version'], { stdio: 'ignore' });
    check.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') reject(new FfmpegNotFoundError());
      else reject(err);
    });
    check.on('close', resolve);
  });
}
