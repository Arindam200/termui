/**
 * Shared TTY / color environment detection for adapters (NO_COLOR, FORCE_COLOR, CLICOLOR).
 */

export function isColorEnabled(stream: NodeJS.WritableStream = process.stdout): boolean {
  if (process.env['NO_COLOR'] !== undefined && process.env['NO_COLOR'] !== '') {
    return false;
  }
  const force = process.env['FORCE_COLOR'];
  if (force === '0' || force === 'false') return false;
  if (force === '1' || force === '2' || force === '3' || force === 'true') return true;

  const cliColor = process.env['CLICOLOR'];
  if (cliColor === '0') return false;
  if (cliColor === '1') return true;

  return stream.isTTY === true;
}
