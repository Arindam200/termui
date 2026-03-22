/**
 * termui/semver-update — compare semver against latest from npm.
 * Requires optional peers `semver` and `latest-version`.
 */

export async function checkPackageUpdate(
  packageName: string,
  current: string
): Promise<{ current: string; latest: string | null; updateAvailable: boolean }> {
  let latest: string | null = null;
  try {
    const latestVersion = (await import('latest-version')).default;
    latest = await latestVersion(packageName);
  } catch {
    return { current, latest: null, updateAvailable: false };
  }
  try {
    const semver = (await import('semver')).default;
    const updateAvailable = latest ? semver.gt(latest, current) : false;
    return { current, latest, updateAvailable };
  } catch {
    return { current, latest, updateAvailable: false };
  }
}
