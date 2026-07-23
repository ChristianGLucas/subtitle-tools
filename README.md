# subtitle-tools

Composable Axiom nodes for deterministic subtitle/caption file parsing,
conversion, and manipulation — SRT (SubRip), WebVTT, and ASS/SSA
(SubStation Alpha), plus SBV/SMI/LRC via the generic convert node. Wraps
[subsrt-ts](https://github.com/leranjun/subsrt-ts) (MIT, zero runtime
dependencies).

Built for the [Axiom](https://axiomide.com) marketplace, publisher handle
`christiangeorgelucas`.

Every node is a pure, deterministic, single-input -> single-output
transform over caller-supplied text: no video, no network, no wall-clock,
no randomness. Timings are always normalized to integer milliseconds
regardless of the source format's native time notation.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/subtitle-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/subtitle-tools/DetectFormat --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/subtitle-tools/0.1.0/DetectFormat \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/subtitle-tools/DetectFormat`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

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
