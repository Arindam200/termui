import { useState, useRef, useCallback, useEffect } from 'react';
import type { Key } from './useInput.js';

// ─── Public types ──────────────────────────────────────────────────────────────

export type PushToTalkStatus = 'idle' | 'warmup' | 'recording' | 'transcribing' | 'error';

/** Minimal interface every capture backend must implement. */
export interface VoiceCapture {
  start(): void | Promise<void>;
  stop(): Promise<Buffer>;
  cancel?(): void | Promise<void>;
}

export interface PushToTalkOptions {
  captureFactory: () => VoiceCapture;
  transcribe: (audio: Buffer) => Promise<string>;
  /** Enable or disable the hook without unmounting. Default: true. */
  enabled?: boolean;
  /**
   * Number of rapid consecutive Space events required to activate recording.
   * Default: 2 (initial press + 1 rapid repeat).
   */
  warmupRepeatThreshold?: number;
  /**
   * Milliseconds of silence between Space events that counts as "released".
   * Used both as warmup timeout and release debounce. Default: 180.
   */
  releaseDebounceMs?: number;
  onTranscript: (text: string) => void;
  onError?: (error: Error) => void;
}

export interface HandleInputResult {
  /** When true, TextInput must not append the character to its value. */
  consume: boolean;
  /**
   * When set, TextInput must remove this many trailing characters from its
   * current value (retracts provisional warmup spaces on activation).
   */
  removeTrailingChars?: number;
}

export interface PushToTalkResult {
  status: PushToTalkStatus;
  isListening: boolean;
  /** Human-readable hint string to display near the input. Empty in idle. */
  hint: string;
  handleInput: (input: string, key: Key) => HandleInputResult;
}

// ─── Pure state machine (exported for unit testing) ────────────────────────────

export interface PttState {
  status: PushToTalkStatus;
  /** Number of Space characters inserted into the field during warmup. */
  typedWarmupChars: number;
  error: Error | null;
}

export type PttAction =
  | { type: 'SPACE_PRESS' }
  | { type: 'SPACE_WARMUP_CHAR' }
  | { type: 'SPACE_ACTIVATE' }
  | { type: 'WARMUP_TIMEOUT' }
  | { type: 'STOP_RECORDING' }
  | { type: 'TRANSCRIPT' }
  | { type: 'ERROR'; error: Error }
  | { type: 'RESET' };

export const initialPttState: PttState = {
  status: 'idle',
  typedWarmupChars: 0,
  error: null,
};

export function pttReducer(state: PttState, action: PttAction): PttState {
  switch (action.type) {
    case 'SPACE_PRESS':
      if (state.status !== 'idle') return state;
      return { ...state, status: 'warmup', typedWarmupChars: 1 };

    case 'SPACE_WARMUP_CHAR':
      if (state.status !== 'warmup') return state;
      return { ...state, typedWarmupChars: state.typedWarmupChars + 1 };

    case 'SPACE_ACTIVATE':
      if (state.status !== 'warmup') return state;
      return { ...state, status: 'recording', typedWarmupChars: 0 };

    case 'WARMUP_TIMEOUT':
      if (state.status !== 'warmup') return state;
      return { status: 'idle', typedWarmupChars: 0, error: null };

    case 'STOP_RECORDING':
      if (state.status !== 'recording') return state;
      return { ...state, status: 'transcribing' };

    case 'TRANSCRIPT':
      if (state.status !== 'transcribing') return state;
      return { status: 'idle', typedWarmupChars: 0, error: null };

    case 'ERROR':
      return { ...state, status: 'error', error: action.error };

    case 'RESET':
      return { status: 'idle', typedWarmupChars: 0, error: null };

    default:
      return state;
  }
}

// ─── React hook ────────────────────────────────────────────────────────────────

const HINTS: Record<PushToTalkStatus, string> = {
  idle: '',
  warmup: 'Keep holding to speak\u2026',
  recording: 'Listening\u2026 release to transcribe',
  transcribing: 'Transcribing\u2026',
  error: 'Voice input error',
};

export function usePushToTalk(options: PushToTalkOptions): PushToTalkResult {
  // Keep latest options in a ref so callbacks never go stale.
  const optsRef = useRef(options);
  optsRef.current = options;

  const [status, setStatus] = useState<PushToTalkStatus>('idle');
  const statusRef = useRef<PushToTalkStatus>('idle');

  // Mutable bookkeeping (not part of render state).
  const warmupCountRef = useRef(0);
  const warmupCharsRef = useRef(0);
  const warmupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureRef = useRef<VoiceCapture | null>(null);

  function setStatusSync(s: PushToTalkStatus) {
    statusRef.current = s;
    setStatus(s);
  }

  function clearWarmupTimer() {
    if (warmupTimerRef.current !== null) {
      clearTimeout(warmupTimerRef.current);
      warmupTimerRef.current = null;
    }
  }

  function clearReleaseTimer() {
    if (releaseTimerRef.current !== null) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }

  function resetToIdle() {
    clearWarmupTimer();
    clearReleaseTimer();
    warmupCountRef.current = 0;
    warmupCharsRef.current = 0;
    setStatusSync('idle');
  }

  async function stopAndTranscribe() {
    const capture = captureRef.current;
    if (!capture) return;
    try {
      const audio = await capture.stop();
      captureRef.current = null;
      const text = await optsRef.current.transcribe(audio);
      setStatusSync('idle');
      optsRef.current.onTranscript(text);
    } catch (err) {
      captureRef.current = null;
      const error = err instanceof Error ? err : new Error(String(err));
      setStatusSync('error');
      optsRef.current.onError?.(error);
    }
  }

  async function startCapture(releaseDebounceMs: number) {
    try {
      const capture = optsRef.current.captureFactory();
      captureRef.current = capture;
      await capture.start();
      // Arm a release debounce timer for terminals that don't emit release events.
      releaseTimerRef.current = setTimeout(() => {
        if (statusRef.current === 'recording') {
          setStatusSync('transcribing');
          void stopAndTranscribe();
        }
      }, releaseDebounceMs);
    } catch (err) {
      captureRef.current = null;
      const error = err instanceof Error ? err : new Error(String(err));
      setStatusSync('error');
      optsRef.current.onError?.(error);
    }
  }

  // "Stable callback" pattern: the ref always points to the latest implementation
  // so callers get a stable function reference while still seeing current state.
  const handleInputImpl = (input: string, key: Key): HandleInputResult => {
    const { enabled = true, warmupRepeatThreshold = 2, releaseDebounceMs = 180 } =
      optsRef.current;

    if (!enabled) return { consume: false };

    const currentStatus = statusRef.current;
    const isSpaceChar = input === ' ';
    const isModified = key.ctrl || key.meta || key.shift;
    const isSpace = isSpaceChar && !isModified;
    const eventType = (key as Key & { eventType?: string }).eventType;

    // ── Explicit release event (Kitty/WezTerm/Ghostty) ──────────────────────
    if (eventType === 'release') {
      if (isSpace && currentStatus === 'recording') {
        clearReleaseTimer();
        setStatusSync('transcribing');
        void stopAndTranscribe();
        return { consume: true };
      }
      if (isSpace && currentStatus === 'warmup') {
        resetToIdle();
      }
      return { consume: false };
    }

    // ── Non-space key ────────────────────────────────────────────────────────
    if (!isSpace) {
      if (currentStatus === 'warmup') {
        clearWarmupTimer();
        warmupCountRef.current = 0;
        warmupCharsRef.current = 0;
        setStatusSync('idle');
      }
      return { consume: false };
    }

    // ── Space press/repeat ───────────────────────────────────────────────────
    switch (currentStatus) {
      case 'idle': {
        warmupCountRef.current = 1;
        warmupCharsRef.current = 1;

        if (warmupRepeatThreshold <= 1) {
          // Threshold of 1: activate on first press, space is NOT inserted.
          setStatusSync('recording');
          void startCapture(releaseDebounceMs);
          return { consume: true, removeTrailingChars: 0 };
        }

        setStatusSync('warmup');
        warmupTimerRef.current = setTimeout(() => {
          warmupCountRef.current = 0;
          warmupCharsRef.current = 0;
          setStatusSync('idle');
        }, releaseDebounceMs);
        // Let the initial space through so single-tap still inserts a space.
        return { consume: false };
      }

      case 'warmup': {
        clearWarmupTimer();
        warmupCountRef.current += 1;

        if (warmupCountRef.current >= warmupRepeatThreshold) {
          const retract = warmupCharsRef.current;
          warmupCharsRef.current = 0;
          warmupCountRef.current = 0;
          setStatusSync('recording');
          void startCapture(releaseDebounceMs);
          return { consume: true, removeTrailingChars: retract };
        }

        // Still building up; let this space through and reset the timer.
        warmupCharsRef.current += 1;
        warmupTimerRef.current = setTimeout(() => {
          warmupCountRef.current = 0;
          warmupCharsRef.current = 0;
          setStatusSync('idle');
        }, releaseDebounceMs);
        return { consume: false };
      }

      case 'recording': {
        // Suppress spaces. Reset release debounce timer since a repeat arrived.
        clearReleaseTimer();
        releaseTimerRef.current = setTimeout(() => {
          if (statusRef.current === 'recording') {
            setStatusSync('transcribing');
            void stopAndTranscribe();
          }
        }, releaseDebounceMs);
        return { consume: true };
      }

      default:
        // transcribing or error: suppress spaces.
        return { consume: true };
    }
  };

  const handleInputImplRef = useRef(handleInputImpl);
  handleInputImplRef.current = handleInputImpl;

  const handleInput = useCallback(
    (input: string, key: Key): HandleInputResult => handleInputImplRef.current(input, key),
    []
  );

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      clearWarmupTimer();
      clearReleaseTimer();
      void captureRef.current?.cancel?.();
    };
  }, []);

  return {
    status,
    isListening: status === 'recording',
    hint: HINTS[status],
    handleInput,
  };
}
