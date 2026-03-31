// Run: GITHUB_TOKEN=your_token npx tsx examples/with-github/index.ts

import { createOctokit } from 'termui/github';

const token = process.env['GITHUB_TOKEN'];

if (!token) {
  console.log('No GITHUB_TOKEN found in environment.\n');
  console.log('To run this example:');
  console.log('  export GITHUB_TOKEN=ghp_your_personal_access_token');
  console.log('  npx tsx examples/with-github/index.ts\n');
  console.log('Generate a token at: https://github.com/settings/tokens');
  console.log('Required scopes: repo (or public_repo for public repos only)');
  process.exit(0);
}

async function main() {
  let octokit: Awaited<ReturnType<typeof createOctokit>>;

  try {
    octokit = await createOctokit(token);
  } catch (err) {
    console.error(
      'Failed to initialise Octokit. Is @octokit/rest installed?\n',
      err instanceof Error ? err.message : err
    );
    console.error('\nInstall it with: pnpm add @octokit/rest');
    process.exit(1);
  }

  try {
    // Fetch authenticated user info
    const { data: user } = await (
      octokit as import('@octokit/rest').Octokit
    ).rest.users.getAuthenticated();

    console.log(`Authenticated as: ${user.login} (${user.name ?? 'no name'})\n`);

    // Fetch the first 5 repos
    const { data: repos } = await (
      octokit as import('@octokit/rest').Octokit
    ).rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 5,
    });

    if (repos.length === 0) {
      console.log('No repositories found.');
      return;
    }

    console.log(`Your 5 most recently updated repositories:\n`);
    for (const repo of repos) {
      const visibility = repo.private ? 'private' : 'public';
      const stars = repo.stargazers_count ?? 0;
      console.log(`  ${repo.full_name}`);
      console.log(
        `    ${visibility} · ${stars} star${stars !== 1 ? 's' : ''} · ${repo.language ?? 'unknown language'}`
      );
      if (repo.description) console.log(`    ${repo.description}`);
      console.log();
    }
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 401) {
      console.error(
        'Authentication failed. Check that your GITHUB_TOKEN is valid and not expired.'
      );
    } else if (e.status === 403) {
      console.error('Forbidden. Your token may lack the required scopes (repo or public_repo).');
    } else {
      console.error('GitHub API error:', e.message ?? err);
    }
    process.exit(1);
  }
}

main();
