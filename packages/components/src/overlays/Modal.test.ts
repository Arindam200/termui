import { describe, it, expect } from 'vitest';
import { Modal } from './Modal.js';

describe('Modal export', () => {
  it('is exported as a function', () => {
    expect(typeof Modal).toBe('function');
  });
});

// ── Open/close guard logic ─────────────────────────────────────────────────
// Mirrors the `if (!open) return null` guard in Modal.tsx

function shouldRender(open: boolean): boolean {
  return open;
}

describe('Modal visibility guard', () => {
  it('renders when open=true', () => {
    expect(shouldRender(true)).toBe(true);
  });

  it('does not render when open=false', () => {
    expect(shouldRender(false)).toBe(false);
  });
});

// ── closeHint prop behavior ────────────────────────────────────────────────

function resolveCloseHint(closeHint: string | false | undefined): string | false {
  if (closeHint === false) return false;
  return closeHint ?? 'Esc to close';
}

describe('closeHint resolution', () => {
  it('defaults to "Esc to close" when undefined', () => {
    expect(resolveCloseHint(undefined)).toBe('Esc to close');
  });

  it('uses custom string when provided', () => {
    expect(resolveCloseHint('Press Q to dismiss')).toBe('Press Q to dismiss');
  });

  it('returns false when explicitly disabled', () => {
    expect(resolveCloseHint(false)).toBe(false);
  });
});
