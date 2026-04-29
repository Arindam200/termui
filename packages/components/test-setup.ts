// Force chalk/ink to emit truecolor ANSI escapes even when running in a
// non-TTY test environment. Required for tests that assert on color output.
process.env.FORCE_COLOR = '3';
