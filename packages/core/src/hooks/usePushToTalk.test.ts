import { describe, it, expect } from 'vitest';
import { pttReducer, initialPttState } from './usePushToTalk.js';
import type { PttState, PttAction } from './usePushToTalk.js';

function apply(state: PttState, ...actions: PttAction[]): PttState {
  return actions.reduce(pttReducer, state);
}

describe('pttReducer', () => {
  // ── idle → warmup ──────────────────────────────────────────────────────────

  it('single SPACE_PRESS moves idle → warmup with typedWarmupChars=1', () => {
    const s = apply(initialPttState, { type: 'SPACE_PRESS' });
    expect(s.status).toBe('warmup');
    expect(s.typedWarmupChars).toBe(1);
  });

  it('SPACE_PRESS is ignored when not idle', () => {
    const warmup = apply(initialPttState, { type: 'SPACE_PRESS' });
    const again = apply(warmup, { type: 'SPACE_PRESS' });
    expect(again).toEqual(warmup);
  });

  // ── warmup accumulation ────────────────────────────────────────────────────

  it('SPACE_WARMUP_CHAR increments typedWarmupChars', () => {
    const s = apply(initialPttState, { type: 'SPACE_PRESS' }, { type: 'SPACE_WARMUP_CHAR' });
    expect(s.status).toBe('warmup');
    expect(s.typedWarmupChars).toBe(2);
  });

  it('SPACE_WARMUP_CHAR is ignored when not in warmup', () => {
    const s = apply(initialPttState, { type: 'SPACE_WARMUP_CHAR' });
    expect(s).toEqual(initialPttState);
  });

  // ── warmup → recording ─────────────────────────────────────────────────────

  it('SPACE_ACTIVATE moves warmup → recording and resets typedWarmupChars', () => {
    const s = apply(
      initialPttState,
      { type: 'SPACE_PRESS' },
      { type: 'SPACE_WARMUP_CHAR' },
      { type: 'SPACE_ACTIVATE' }
    );
    expect(s.status).toBe('recording');
    expect(s.typedWarmupChars).toBe(0);
  });

  it('SPACE_ACTIVATE is ignored when not in warmup', () => {
    const s = apply(initialPttState, { type: 'SPACE_ACTIVATE' });
    expect(s).toEqual(initialPttState);
  });

  // ── warmup timeout ─────────────────────────────────────────────────────────

  it('WARMUP_TIMEOUT moves warmup → idle and clears warmupChars', () => {
    const s = apply(
      initialPttState,
      { type: 'SPACE_PRESS' },
      { type: 'SPACE_WARMUP_CHAR' },
      { type: 'WARMUP_TIMEOUT' }
    );
    expect(s.status).toBe('idle');
    expect(s.typedWarmupChars).toBe(0);
  });

  it('WARMUP_TIMEOUT is ignored when not in warmup', () => {
    const s = apply(initialPttState, { type: 'WARMUP_TIMEOUT' });
    expect(s).toEqual(initialPttState);
  });

  // ── recording → transcribing ───────────────────────────────────────────────

  it('STOP_RECORDING moves recording → transcribing', () => {
    const s = apply(
      initialPttState,
      { type: 'SPACE_PRESS' },
      { type: 'SPACE_ACTIVATE' },
      { type: 'STOP_RECORDING' }
    );
    expect(s.status).toBe('transcribing');
  });

  it('STOP_RECORDING is ignored when not recording', () => {
    const s = apply(initialPttState, { type: 'STOP_RECORDING' });
    expect(s).toEqual(initialPttState);
  });

  it('repeated STOP_RECORDING while already recording still transitions once', () => {
    const recording = apply(
      initialPttState,
      { type: 'SPACE_PRESS' },
      { type: 'SPACE_ACTIVATE' }
    );
    const s1 = apply(recording, { type: 'STOP_RECORDING' });
    const s2 = apply(s1, { type: 'STOP_RECORDING' });
    expect(s1.status).toBe('transcribing');
    expect(s2.status).toBe('transcribing'); // second is a no-op
  });

  // ── transcribing → idle ────────────────────────────────────────────────────

  it('TRANSCRIPT moves transcribing → idle', () => {
    const s = apply(
      initialPttState,
      { type: 'SPACE_PRESS' },
      { type: 'SPACE_ACTIVATE' },
      { type: 'STOP_RECORDING' },
      { type: 'TRANSCRIPT' }
    );
    expect(s.status).toBe('idle');
    expect(s.error).toBeNull();
  });

  it('TRANSCRIPT is ignored when not transcribing', () => {
    const s = apply(initialPttState, { type: 'TRANSCRIPT' });
    expect(s).toEqual(initialPttState);
  });

  // ── error ──────────────────────────────────────────────────────────────────

  it('ERROR from any state transitions to error and stores the error', () => {
    const err = new Error('capture failed');
    const fromIdle = apply(initialPttState, { type: 'ERROR', error: err });
    expect(fromIdle.status).toBe('error');
    expect(fromIdle.error).toBe(err);

    const recording = apply(initialPttState, { type: 'SPACE_PRESS' }, { type: 'SPACE_ACTIVATE' });
    const fromRecording = apply(recording, { type: 'ERROR', error: err });
    expect(fromRecording.status).toBe('error');
    expect(fromRecording.error).toBe(err);
  });

  // ── reset ──────────────────────────────────────────────────────────────────

  it('RESET returns to idle from any state', () => {
    const errorState = apply(initialPttState, { type: 'ERROR', error: new Error('x') });
    const s = apply(errorState, { type: 'RESET' });
    expect(s).toEqual(initialPttState);
  });

  // ── warmup chars are only retracted on activation, never on timeout ────────

  it('warmup spaces remain in field when warmup times out (reducer resets chars)', () => {
    // The reducer resets typedWarmupChars on WARMUP_TIMEOUT so the hook knows
    // there is nothing to retract (chars already exist in the field).
    const s = apply(
      initialPttState,
      { type: 'SPACE_PRESS' },         // typedWarmupChars = 1
      { type: 'SPACE_WARMUP_CHAR' },   // typedWarmupChars = 2
      { type: 'WARMUP_TIMEOUT' }       // back to idle, chars = 0
    );
    expect(s.typedWarmupChars).toBe(0);
    expect(s.status).toBe('idle');
  });

  it('warmup chars are zeroed on SPACE_ACTIVATE so TextInput can use the pre-activation count', () => {
    const beforeActivate = apply(
      initialPttState,
      { type: 'SPACE_PRESS' },
      { type: 'SPACE_WARMUP_CHAR' }
    );
    // The hook reads typedWarmupChars BEFORE dispatching SPACE_ACTIVATE.
    expect(beforeActivate.typedWarmupChars).toBe(2);

    const afterActivate = apply(beforeActivate, { type: 'SPACE_ACTIVATE' });
    expect(afterActivate.typedWarmupChars).toBe(0); // zeroed by reducer
  });
});
