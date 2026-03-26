import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ora } from './index.js';

// Mock stdout to avoid actual terminal output during tests
beforeEach(() => {
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  // clearLine / cursorTo only exist on TTY streams; patch or define them
  if (typeof (process.stdout as NodeJS.WriteStream).clearLine !== 'function') {
    (process.stdout as NodeJS.WriteStream & { clearLine: unknown }).clearLine = () => true;
  }
  if (typeof (process.stdout as NodeJS.WriteStream).cursorTo !== 'function') {
    (process.stdout as NodeJS.WriteStream & { cursorTo: unknown }).cursorTo = () => true;
  }
  vi.spyOn(process.stdout as NodeJS.WriteStream, 'clearLine').mockImplementation(() => true);
  vi.spyOn(process.stdout as NodeJS.WriteStream, 'cursorTo').mockImplementation(() => true);
});

describe('ora adapter', () => {
  it('creates a spinner instance', () => {
    const spinner = ora('Loading...');
    expect(spinner).toBeDefined();
    expect(typeof spinner.start).toBe('function');
    expect(typeof spinner.stop).toBe('function');
    expect(typeof spinner.succeed).toBe('function');
    expect(typeof spinner.fail).toBe('function');
    expect(typeof spinner.warn).toBe('function');
    expect(typeof spinner.info).toBe('function');
  });

  it('accepts string option', () => {
    const spinner = ora('My task');
    expect(spinner.text).toBe('My task');
  });

  it('accepts object option', () => {
    const spinner = ora({ text: 'Loading data', color: 'cyan' });
    expect(spinner.text).toBe('Loading data');
    expect(spinner.color).toBe('cyan');
  });

  it('is not spinning initially', () => {
    const spinner = ora('test');
    expect(spinner.isSpinning).toBe(false);
  });

  it('start() sets isSpinning to true', () => {
    const spinner = ora('test');
    spinner.start();
    expect(spinner.isSpinning).toBe(true);
    spinner.stop();
  });

  it('stop() sets isSpinning to false', () => {
    const spinner = ora('test');
    spinner.start();
    spinner.stop();
    expect(spinner.isSpinning).toBe(false);
  });

  it('succeed() stops spinner', () => {
    const spinner = ora('working').start();
    spinner.succeed('Done!');
    expect(spinner.isSpinning).toBe(false);
  });

  it('fail() stops spinner', () => {
    const spinner = ora('working').start();
    spinner.fail('Failed!');
    expect(spinner.isSpinning).toBe(false);
  });

  it('is chainable from start()', () => {
    const spinner = ora('test');
    const result = spinner.start();
    expect(result).toBe(spinner);
    spinner.stop();
  });

  it('allows updating text mid-spin', () => {
    const spinner = ora('step 1').start();
    spinner.text = 'step 2';
    expect(spinner.text).toBe('step 2');
    spinner.stop();
  });
});
