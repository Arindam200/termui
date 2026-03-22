import { describe, it, expect } from 'vitest';
import { Form, useFormContext } from './Form.js';

// ── Export smoke tests ─────────────────────────────────────────────────────

describe('Form exports', () => {
  it('exports Form as a function', () => {
    expect(typeof Form).toBe('function');
  });

  it('exports useFormContext as a function', () => {
    expect(typeof useFormContext).toBe('function');
  });
});

// ── Inline form validation logic ───────────────────────────────────────────
// Mirrors the validation loop inside Form's useInput handler.

interface FormField {
  name: string;
  validate?: (value: unknown) => string | null;
}

function runValidation(
  fields: FormField[],
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const err = field.validate ? field.validate(values[field.name]) : null;
    if (err) errors[field.name] = err;
  }
  return errors;
}

describe('runValidation', () => {
  it('returns empty errors when all fields are valid', () => {
    const fields: FormField[] = [{ name: 'name', validate: (v) => (v ? null : 'Required') }];
    const errors = runValidation(fields, { name: 'Alice' });
    expect(errors).toEqual({});
  });

  it('returns an error for a failing field', () => {
    const fields: FormField[] = [{ name: 'name', validate: (v) => (v ? null : 'Required') }];
    const errors = runValidation(fields, { name: '' });
    expect(errors.name).toBe('Required');
  });

  it('collects errors for multiple failing fields', () => {
    const fields: FormField[] = [
      { name: 'name', validate: (v) => (v ? null : 'Name required') },
      { name: 'email', validate: (v) => (v ? null : 'Email required') },
    ];
    const errors = runValidation(fields, { name: '', email: '' });
    expect(errors.name).toBe('Name required');
    expect(errors.email).toBe('Email required');
  });

  it('only marks the invalid field when one passes and one fails', () => {
    const fields: FormField[] = [
      { name: 'name', validate: (v) => (v ? null : 'Required') },
      { name: 'age', validate: (v) => (typeof v === 'number' ? null : 'Must be number') },
    ];
    const errors = runValidation(fields, { name: 'Alice', age: 'not-a-number' });
    expect(errors.name).toBeUndefined();
    expect(errors.age).toBe('Must be number');
  });

  it('skips fields with no validate function', () => {
    const fields: FormField[] = [{ name: 'bio' }];
    const errors = runValidation(fields, { bio: '' });
    expect(errors).toEqual({});
  });

  it('handles an empty fields array', () => {
    const errors = runValidation([], { name: 'Alice' });
    expect(errors).toEqual({});
  });

  it('uses undefined for missing field values', () => {
    const fields: FormField[] = [
      { name: 'name', validate: (v) => (v === undefined ? 'Missing' : null) },
    ];
    const errors = runValidation(fields, {});
    expect(errors.name).toBe('Missing');
  });
});

// ── isDirty logic ──────────────────────────────────────────────────────────
// Mirrors the setFieldValue / isDirty state transition.

function simulateDirtyTracking() {
  let isDirty = false;
  const values: Record<string, unknown> = {};

  const setFieldValue = (name: string, value: unknown) => {
    values[name] = value;
    isDirty = true;
  };

  return { setFieldValue, getIsDirty: () => isDirty, getValues: () => values };
}

describe('dirty tracking', () => {
  it('starts as not dirty', () => {
    const { getIsDirty } = simulateDirtyTracking();
    expect(getIsDirty()).toBe(false);
  });

  it('becomes dirty after setFieldValue', () => {
    const { setFieldValue, getIsDirty } = simulateDirtyTracking();
    setFieldValue('name', 'Alice');
    expect(getIsDirty()).toBe(true);
  });

  it('stores the value correctly', () => {
    const { setFieldValue, getValues } = simulateDirtyTracking();
    setFieldValue('name', 'Alice');
    setFieldValue('age', 30);
    expect(getValues()).toEqual({ name: 'Alice', age: 30 });
  });

  it('overwrites a value on repeated calls', () => {
    const { setFieldValue, getValues } = simulateDirtyTracking();
    setFieldValue('name', 'Alice');
    setFieldValue('name', 'Bob');
    expect(getValues().name).toBe('Bob');
  });
});
