# Changesets

This directory is used by [Changesets](https://github.com/changesets/changesets) to track unreleased changes.

## How to add a changeset

After making changes to a package, run:

```bash
pnpm changeset
```

This creates a markdown file in `.changeset/` describing:

- Which packages changed (`@termui/core`, `@termui/components`, `@termui/cli`, `@termui/adapters`, `@termui/testing`)
- The semver bump type (`patch`, `minor`, `major`)
- A human-readable summary

## Release process

1. Open a PR with your changes + a changeset file
2. CI validates the changeset exists
3. On merge to `main`, the "Version Packages" bot PR is auto-created
4. Merge the version PR to publish to npm

## Bump types

| Change                            | Bump    |
| --------------------------------- | ------- |
| Bug fix, docs, refactor           | `patch` |
| New component, new prop, new hook | `minor` |
| Breaking API change, removed prop | `major` |
