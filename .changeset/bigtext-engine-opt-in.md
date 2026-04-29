---
'@termui/components': major
---

**BigText: dual-engine, cfonts is now opt-in.**

The component now defaults to a built-in `'basic'` engine (a 5-row bitmap font, zero dependencies). To get the richer rendering — 13 fonts, gradients, alignment, letter spacing, backgrounds — pass `engine="cfonts"` and install `cfonts` in your project (`npm install cfonts`). If `cfonts` isn't installed, BigText logs a one-line warning and falls back to the basic engine so the UI never breaks.

**Why:** the previous release made `cfonts` a hard runtime dependency of `@termui/components`, which pulled ~400 KB of font JSON into every app that imported anything from the package — including apps that never used BigText. `cfonts` is now an optional `peerDependency`.

**Breaking changes:**

- `cfonts` moved from `dependencies` → `peerDependencies` (optional). Existing users who relied on the implicit install must add it explicitly.
- BigText defaults `engine="basic"`. If you were using `gradient`, `align`, `letterSpacing`, `lineHeight`, `background`, or any cfonts font name, add `engine="cfonts"` to your call sites.
- `SplashScreen.titleColorAlt` semantics now depend on `engine`: `'cfonts'` → smooth glyph gradient; `'basic'` → alternating-row colors (legacy striped look). Pass `engine="cfonts"` to keep the gradient look introduced in the previous release.
- Registry `big-text` component bumped to `2.0.0`. It now ships `BigText.tsx` + `BigText.font.ts` (the basic engine's font data) and lists `cfonts` under `optionalDeps` instead of `deps`.

**New exports** from `@termui/components`:

- `BigTextEngine`, `BigTextAlign` types
- `BIG_TEXT_FONT`, `BIG_TEXT_FALLBACK`, `decodeBigTextRow` — the basic engine's font data, exported so templates (e.g. `SplashScreen`) can render alternating-row effects without re-encoding the bitmap.
