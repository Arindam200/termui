import { describe, it, expect } from 'vitest';
import { Wizard } from './Wizard.js';

// ── Export smoke test ──────────────────────────────────────────────────────

describe('Wizard export', () => {
  it('is exported as a function', () => {
    expect(typeof Wizard).toBe('function');
  });
});

// ── Wizard step navigation logic ───────────────────────────────────────────
// Mirrors the step advance / back logic inside Wizard's useInput handler.

interface Step {
  key: string;
  validate?: () => boolean | string;
}

function createWizardState(steps: Step[]) {
  let current = 0;
  let error: string | null = null;

  const next = () => {
    const step = steps[current]!;
    if (step.validate) {
      const result = step.validate();
      if (result !== true) {
        error = typeof result === 'string' ? result : 'Validation failed';
        return false;
      }
    }
    error = null;
    if (current < steps.length - 1) {
      current++;
      return true;
    }
    return 'complete';
  };

  const back = () => {
    error = null;
    if (current > 0) {
      current--;
      return true;
    }
    return false;
  };

  return {
    getStep: () => current,
    getError: () => error,
    next,
    back,
    isFirst: () => current === 0,
    isLast: () => current === steps.length - 1,
  };
}

describe('Wizard step navigation', () => {
  const steps: Step[] = [{ key: 'name' }, { key: 'email' }, { key: 'confirm' }];

  it('starts at step 0', () => {
    const wiz = createWizardState(steps);
    expect(wiz.getStep()).toBe(0);
  });

  it('advances to next step on next()', () => {
    const wiz = createWizardState(steps);
    wiz.next();
    expect(wiz.getStep()).toBe(1);
  });

  it('goes back on back()', () => {
    const wiz = createWizardState(steps);
    wiz.next();
    wiz.back();
    expect(wiz.getStep()).toBe(0);
  });

  it('does not go before step 0', () => {
    const wiz = createWizardState(steps);
    const result = wiz.back();
    expect(result).toBe(false);
    expect(wiz.getStep()).toBe(0);
  });

  it('returns "complete" when advancing past the last step', () => {
    const wiz = createWizardState(steps);
    wiz.next(); // → 1
    wiz.next(); // → 2
    const result = wiz.next(); // last step → complete
    expect(result).toBe('complete');
    expect(wiz.getStep()).toBe(2);
  });

  it('reports isFirst correctly', () => {
    const wiz = createWizardState(steps);
    expect(wiz.isFirst()).toBe(true);
    wiz.next();
    expect(wiz.isFirst()).toBe(false);
  });

  it('reports isLast correctly', () => {
    const wiz = createWizardState(steps);
    expect(wiz.isLast()).toBe(false);
    wiz.next();
    wiz.next();
    expect(wiz.isLast()).toBe(true);
  });
});

// ── Wizard validation ──────────────────────────────────────────────────────

describe('Wizard validation', () => {
  it('blocks advance when validate() returns false', () => {
    const steps: Step[] = [{ key: 'name', validate: () => false }];
    const wiz = createWizardState(steps);
    wiz.next();
    expect(wiz.getStep()).toBe(0);
    expect(wiz.getError()).toBe('Validation failed');
  });

  it('blocks advance when validate() returns an error string', () => {
    const steps: Step[] = [{ key: 'name', validate: () => 'Name is required' }];
    const wiz = createWizardState(steps);
    wiz.next();
    expect(wiz.getStep()).toBe(0);
    expect(wiz.getError()).toBe('Name is required');
  });

  it('advances when validate() returns true', () => {
    const steps: Step[] = [{ key: 'name', validate: () => true }];
    const wiz = createWizardState(steps);
    wiz.next();
    expect(wiz.getStep()).toBe(0); // only 1 step → complete but stays at 0
  });

  it('clears error on successful advance', () => {
    let valid = false;
    const steps: Step[] = [{ key: 'name', validate: () => valid || 'Required' }, { key: 'done' }];
    const wiz = createWizardState(steps);
    wiz.next(); // fails
    expect(wiz.getError()).toBe('Required');
    valid = true;
    wiz.next(); // succeeds
    expect(wiz.getError()).toBeNull();
  });

  it('clears error on back()', () => {
    const steps: Step[] = [{ key: 'a' }, { key: 'b', validate: () => 'Oops' }];
    const wiz = createWizardState(steps);
    wiz.next(); // → 1
    wiz.next(); // fails validation, stays at 1 with error
    expect(wiz.getError()).toBe('Oops');
    wiz.back();
    expect(wiz.getError()).toBeNull();
  });
});

// ── Progress icon logic ────────────────────────────────────────────────────
// Mirrors the icon selection logic in the render.

function getStepIcon(index: number, current: number): string {
  if (index < current) return '●';
  if (index === current) return '◉';
  return '○';
}

describe('step progress icons', () => {
  it('shows ● for completed steps', () => {
    expect(getStepIcon(0, 2)).toBe('●');
    expect(getStepIcon(1, 2)).toBe('●');
  });

  it('shows ◉ for the current step', () => {
    expect(getStepIcon(2, 2)).toBe('◉');
  });

  it('shows ○ for future steps', () => {
    expect(getStepIcon(3, 2)).toBe('○');
  });
});
