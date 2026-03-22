import simpleGit from 'simple-git';

export function getGitBranches(cwd: string): Promise<string[]> {
  return simpleGit(cwd)
    .branchLocal()
    .then((b) => b.all);
}

export async function getGitStatusShort(cwd: string): Promise<string> {
  const git = simpleGit(cwd);
  const s = await git.status();
  return [
    `branch:${s.current}`,
    `ahead:${s.ahead}`,
    `behind:${s.behind}`,
    `staged:${s.staged.length}`,
    `modified:${s.modified.length}`,
    `created:${s.created.length}`,
    `deleted:${s.deleted.length}`,
  ].join(' ');
}
