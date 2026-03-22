# termui/pty

Spawns a pseudo-terminal via optional peer dependency `node-pty`.

## Requirements

- **node-pty** uses native bindings. Install a version that matches your Node.js and OS.
- Unsupported or failed installs: `spawnPty` returns `null` and `usePtyOutput` sets a descriptive error string.

## Platforms

Prebuilt binaries are commonly available for macOS, Windows, and Linux on maintained Node LTS versions. For exotic environments, build from source per [node-pty](https://github.com/microsoft/node-pty) documentation.

## Usage

```ts
import { spawnPty, usePtyOutput } from 'termui/pty';

const p = await spawnPty('bash', ['-c', 'echo hi'], { cols: 80, rows: 24 });
if (p) {
  p.onData((d) => process.stdout.write(d));
  p.onExit(() => {});
}
```

For React/Ink, use `<EmbeddedTerminal />` from `termui/components` or `usePtyOutput` from this package.
