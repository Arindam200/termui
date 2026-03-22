/**
 * termui/conf — conf + env-paths helpers for CLI configuration storage.
 * Requires optional peers `conf` and `env-paths`.
 */

export async function createConf<T extends Record<string, unknown>>(opts: {
  projectName: string;
  defaults?: T;
}): Promise<unknown> {
  const Conf = (await import('conf')).default;
  return new Conf({ projectName: opts.projectName, defaults: opts.defaults });
}

export async function createAppPaths(name: string): Promise<{
  data: string;
  config: string;
  cache: string;
  log: string;
  temp: string;
}> {
  const envPaths = (await import('env-paths')).default;
  return envPaths(name, { suffix: 'termui' });
}
