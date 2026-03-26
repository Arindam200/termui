# TermUI Governance

## Project Maintainers

TermUI is maintained by [Arindam Majumder](https://github.com/Arindam200). Maintainers are responsible for reviewing PRs, triaging issues, cutting releases, and setting project direction.

To become a maintainer, contribute consistently over several months and demonstrate good judgment in code review and design discussions.

---

## Decision-Making

- **Day-to-day changes** (bug fixes, docs, non-breaking features): resolved by maintainer review and merge.
- **Significant features or API additions**: discussed in a GitHub Issue or Discussion before implementation.
- **Breaking changes**: require an RFC (Request for Comments) opened as a GitHub Discussion, a minimum 7-day comment window, and explicit maintainer approval before work begins.
- **Disputes**: the lead maintainer (Arindam Majumder) has final say if consensus cannot be reached.

---

## Sponsorship

TermUI is free and open source. If you or your company rely on it, consider sponsoring to sustain development.

- GitHub Sponsors: [github.com/sponsors/Arindam200](https://github.com/sponsors/Arindam200) _(coming soon)_

**Tiers:**
| Tier | Monthly | Benefits |
|------|---------|----------|
| Supporter | $5 | Name in README |
| Contributor | $25 | Name + priority issue triage |
| Studio | $100 | Logo in README + office hours slot |
| Partner | $500+ | Logo on site + roadmap input |

---

## Component Contributions

All new component proposals must follow the process described in [CONTRIBUTING_COMPONENTS.md](./CONTRIBUTING_COMPONENTS.md). Key steps: open an issue, get maintainer sign-off on API design, implement with tests, and submit a PR against `main`.

---

## Release Process

TermUI uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

1. Every PR that changes public behaviour must include a changeset (`pnpm changeset`).
2. Maintainers merge changesets into a versioning PR when ready to release.
3. After the versioning PR merges, packages are published to npm via CI.
4. Release notes are generated automatically from changeset summaries.

---

## Code of Conduct

All participants are expected to follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Violations can be reported via GitHub Issues or by emailing the maintainers directly.

---

## Community Channels

- **GitHub Discussions** — design proposals, Q&A, show & tell: [github.com/Arindam200/termi/discussions](https://github.com/Arindam200/termi/discussions)
- **GitHub Issues** — bug reports and feature requests: [github.com/Arindam200/termi/issues](https://github.com/Arindam200/termi/issues)
