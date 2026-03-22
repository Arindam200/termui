/**
 * termui/execa adapter — subprocess helpers via optional peer `execa`.
 */

export async function runCommand(
  command: string,
  args: string[],
  options?: Record<string, unknown>
): Promise<unknown> {
  const { execa } = await import('execa');
  return execa(command, args, options);
}
