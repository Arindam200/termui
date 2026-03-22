/**
 * Test setup for CLI package — filesystem and HTTP mocking.
 *
 * memfs provides an in-memory filesystem for testing file operations
 * without touching the real disk.
 *
 * msw (Mock Service Worker) provides HTTP mocking for registry fetch tests
 * in a Node.js environment.
 *
 * Usage in tests:
 *
 *   import { vol } from 'memfs';
 *
 *   beforeEach(() => {
 *     vol.reset();
 *     vol.fromJSON({
 *       '/project/termui.config.json': JSON.stringify({ version: '0.1.0', ... }),
 *     });
 *   });
 *
 * For HTTP mocking with msw:
 *
 *   import { setupServer } from 'msw/node';
 *   import { http, HttpResponse } from 'msw';
 *
 *   const server = setupServer(
 *     http.get('https://registry.termui.dev/components', () => {
 *       return HttpResponse.json({ components: [] });
 *     })
 *   );
 *
 *   beforeAll(() => server.listen());
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */

// Global test utilities available via vitest globals
// No explicit imports needed when using `globals: true` in vitest.config.ts

// Suppress console output during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Optionally suppress console during tests; comment out to see output
  // console.log = () => {};
  // console.error = () => {};
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
