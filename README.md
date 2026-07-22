# subtitle-tools

Composable Axiom nodes for deterministic subtitle/caption file parsing,
conversion, and manipulation — SRT (SubRip), WebVTT, and ASS/SSA
(SubStation Alpha), plus SBV/SMI/LRC via the generic convert node. Wraps
[subsrt-ts](https://github.com/leranjun/subsrt-ts) (MIT, zero runtime
dependencies).

Built for the [Axiom](https://axiom.dev) marketplace, publisher handle
`christiangeorgelucas`.

Every node is a pure, deterministic, single-input -> single-output
transform over caller-supplied text: no video, no network, no wall-clock,
no randomness. Timings are always normalized to integer milliseconds
regardless of the source format's native time notation.

## Nodes

| Node | What it does |
|---|---|
| `DetectFormat` | Identifies SRT/WebVTT/ASS/SSA/SBV/SMI/LRC from content alone. |
| `ParseSubtitle` | Auto-detecting parse into the normalized `SubtitleDocument`. |
| `ParseSrt` / `ParseWebVtt` / `ParseAss` | Force-parse as a specific format. WebVTT capture includes the header banner, NOTE/REGION/STYLE blocks, and per-cue positioning settings; ASS/SSA capture includes style definitions and dialogue columns. |
| `SerializeSrt` / `SerializeWebVtt` / `SerializeAss` | Serialize a `SubtitleDocument` back to file text. |
| `ConvertSrtToWebVtt` / `ConvertWebVttToSrt` | The two highest-demand direct conversions. |
| `ConvertFormat` | Generic conversion between any two of the seven supported formats. |
| `ShiftTiming` | Resync every cue by a constant millisecond offset. |
| `ScaleTiming` | Re-time by a factor (or derive one from a framerate pair) — framerate-drift correction. |
| `ExtractText` | Plain cue text only, no timing/markup — for feeding an LLM/transcript pipeline. |
| `ExtractRange` | Keep only cues overlapping a time window. |
| `ComputeStats` | Cue count, total duration, span, and reading-speed (chars/sec) statistics. |
| `MergeCues` | Combine consecutive cues within a gap threshold. |
| `RenumberCues` | Reset cue index to sequential 1..N. |
| `StripFormatting` | Overwrite raw content with the already-cleaned text. |
| `ValidateSubtitle` | Report overlapping/negative-duration/out-of-order/empty-text issues by cue index. |
| `FixCommonIssues` | Sort by start time and clamp non-positive durations. |

## Implementation notes

- `subsrt-ts` ships ESM-only with no CommonJS build, so it is vendored as
  TypeScript source under `nodes/vendor/subsrt-ts/` (not npm-installed) —
  see that directory's `NOTICE.md` for the full rationale and exactly what
  was changed (import-extension stripping only; the parsing/building logic
  is untouched).
- A handful of confirmed upstream library gaps are corrected in
  `nodes/lib.ts`, each documented at its call site: a stricter-than-spec
  WebVTT `detect()`, a silently-dropped WebVTT inline header, and an
  array-position-based (rather than content-cue-count-based) SRT/WebVTT
  cue-numbering bug when the source format carries header/style entries.

## License

MIT — see `LICENSE`.
