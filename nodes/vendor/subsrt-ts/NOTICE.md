# Vendored: subsrt-ts (subtitle parse/build/detect/convert/resync engine)

The `.ts` files in this directory are the core library of
[`subsrt-ts`](https://www.npmjs.com/package/subsrt-ts) version **2.1.2**
(MIT, copied verbatim from its `lib/` directory — see `LICENSE.txt`
alongside this file), taken from source at
https://github.com/leranjun/subsrt-ts (commit at time of vendoring:
the `2.1.2` npm release tag). subsrt-ts has **zero runtime dependencies** of
its own.

## Why this is vendored instead of `npm install`ed

`subsrt-ts` ships ESM-only (`package.json` has `"type": "module"`, and its
`main`/`types` point at a `dist/` that has no CommonJS build and no
`exports` map with a `"require"` condition). This package compiles to
CommonJS (Axiom's frozen TypeScript node signature/build target: the
deployed build runs `npx tsc --outDir dist` against `module: "commonjs"`).
A static `import` of the npm package would compile to `require()` and Node
would reject it with `ERR_PACKAGE_PATH_NOT_EXPORTED` — the same failure mode
documented for `conventional-commits-parser` in
`../../../../conventional-commit-tools/nodes/vendor/conventional-commits-parser/NOTICE.md`
(a sibling Axiom package that hit the identical class of problem).

Unlike that case, `subsrt-ts`'s *source* is genuine, unbundled TypeScript
(not just a published `.js`/ESM build) — so instead of transpiling a
CommonJS bundle with esbuild, this package simply copies the library's
`lib/` source tree here byte-for-byte and lets Axiom's own `tsc` step
compile it alongside every other node. `tsconfig.json`'s existing
`include: ["nodes/**/*.ts", ...]` glob already matches these files with
zero tsconfig changes — the only edit made to the vendored source was
stripping the `.js` extension from each relative `import` specifier
(`from "./format/index.js"` -> `from "./format/index"`), because
`moduleResolution: "node"` (classic CommonJS resolution, this package's
setting) resolves an extensionless specifier to the sibling `.ts` file at
compile time and to the sibling `.js` file at run time, whereas an
explicit `.js` specifier pointing at a `.ts`-only file resolves under
neither. No other line was changed — every parsing/building/detection
algorithm is byte-for-byte upstream subsrt-ts.

## What's included

The full `lib/` tree: `subsrt.ts` (the `detect`/`parse`/`build`/`convert`/
`resync` entry points), `handler.ts`, `types/`, and every format module
under `format/` (`srt`, `vtt`, `ssa`, `ass`, `sbv`, `smi`, `lrc`, `sub`,
`json`) — so the generic `ParseSubtitle`/`ConvertFormat`/`DetectFormat`
nodes get the library's full format-detection surface (avoiding false
detections against formats this package doesn't have a dedicated node
for), even though the dedicated per-format nodes only target SRT/WebVTT/
ASS/SSA per this package's scope.

## Keeping this in sync

If subsrt-ts publishes a new version worth picking up, re-clone
`https://github.com/leranjun/subsrt-ts` at the new tag, copy `lib/` over
this directory, and re-apply the `.js`-extension-stripping edit (a single
regex: `s/(from ")(\.[^"]+)\.js(")/\1\2\3/g` across `**/*.ts` in this
directory) — do not hand-edit parsing logic.
