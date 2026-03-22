import { describe, it, expect, vi } from 'vitest';
import { Writable } from 'stream';
import { fireEvent } from './events.js';

function makeSink(): { stream: Writable; received: string[] } {
  const received: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      received.push(chunk.toString());
      cb();
    },
  });
  return { stream, received };
}

describe('fireEvent.key', () => {
  it('writes the ANSI sequence for a named key', () => {
    const { stream, received } = makeSink();
    fireEvent.key('up', { stdin: stream });
    expect(received).toEqual(['\x1b[A']);
  });

  it('writes raw string when name is not a known key', () => {
    const { stream, received } = makeSink();
    fireEvent.key('z', { stdin: stream });
    expect(received).toEqual(['z']);
  });

  it('writes enter sequence', () => {
    const { stream, received } = makeSink();
    fireEvent.key('enter', { stdin: stream });
    expect(received).toEqual(['\r']);
  });

  it('writes escape sequence', () => {
    const { stream, received } = makeSink();
    fireEvent.key('escape', { stdin: stream });
    expect(received).toEqual(['\x1b']);
  });
});

describe('fireEvent.type', () => {
  it('writes each character separately', () => {
    const { stream, received } = makeSink();
    fireEvent.type('abc', { stdin: stream });
    expect(received).toEqual(['a', 'b', 'c']);
  });

  it('handles empty string', () => {
    const { stream, received } = makeSink();
    fireEvent.type('', { stdin: stream });
    expect(received).toEqual([]);
  });
});

describe('fireEvent.press', () => {
  it('writes a single character', () => {
    const { stream, received } = makeSink();
    fireEvent.press('x', { stdin: stream });
    expect(received).toEqual(['x']);
  });
});
