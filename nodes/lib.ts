// Shared parsing/building/bounds helpers for the subtitle-tools nodes. Not a
// node and not a test file, so it is neither registered nor collected by
// `axiom validate`/`axiom test`.
//
// The algorithmically hard part — detecting a subtitle format from raw text,
// tokenizing SRT/WebVTT/ASS/SSA (and SBV/SMI/LRC) into structured cues, and
// building well-formed output text with correct per-format time-string
// formatting — is entirely owned by subsrt-ts (MIT, zero runtime
// dependencies; vendored as TypeScript source under ./vendor/subsrt-ts, see
// that directory's NOTICE.md for why it's vendored instead of npm-installed
// and exactly what was changed to make it compile — nothing beyond stripping
// `.js` import-specifier extensions and disabling per-file type-checking on
// the unmodified upstream source).
//
// What lives here is composition atop that library:
//  - converting subsrt-ts's Caption[] into this package's canonical
//    SubtitleDocument message (and back, for the one direction that needs
//    it) — pure data-shape translation, not parsing.
//  - a small amount of genuinely new glue the library's build() functions do
//    not do at all: reconstructing a WebVTT document's header/NOTE blocks/
//    per-cue settings, and an ASS/SSA document's Script Info/Styles blocks,
//    from THIS package's own normalized fields (subsrt-ts's own vtt/ssa
//    build() functions are non-configurable and always emit either nothing
//    or a fixed default for these — confirmed by reading vendor source: vtt
//    build() has no code path that can emit cue settings at all, and ssa/ass
//    build() hardcodes one default Style line regardless of input). Time
//    STRING FORMATTING for both still calls the library's own exported
//    `helper.toTimeString` — the one genuinely fiddly, edge-case-prone part
//    — so only structural templating over already-normalized fields is new
//    here, never a re-derivation of the library's parsing/formatting rules.
//  - resync (shift/scale timing) is NOT reimplemented: ShiftTiming and
//    ScaleTiming both call subsrt.resync() itself (see resyncCues below).
//  - bounds checks and a consistent ok/error result contract.
import subsrt from './vendor/subsrt-ts/subsrt';
import { helper as vttHelper } from './vendor/subsrt-ts/format/vtt';
import { helper as ssaHelper } from './vendor/subsrt-ts/format/ssa';
import type { Caption, ContentCaption, MetaCaption, StyleCaption } from './vendor/subsrt-ts/types/handler';
import { Cue, NoteEntry, StyleEntry, SubtitleDocument } from '../gen/messages_pb';

export class BoundsError extends Error {}

/** Rejects a document containing any cue with a negative start_ms or
 * end_ms. Every per-format time-string formatter this package uses
 * (subsrt-ts's own `helper.toTimeString` for srt/vtt/ass, read directly
 * from vendor/subsrt-ts/format/*.ts) does no negative-number handling at
 * all and silently emits corrupted, unparseable timestamp text for a
 * negative input (e.g. "0-1:0-1:0-1,00-900") while returning normally —
 * so a negative timestamp reaching a Serialize node would otherwise
 * produce garbage output under `ok: true`. Called both by resyncCues
 * (ShiftTiming/ScaleTiming fail fast, before ever computing a negative
 * result the caller would have to notice downstream) and by every
 * build*() function (defense in depth for a document with negative
 * timestamps arriving by any other path — e.g. hand-built flow input). */
export function checkNonNegativeCues(cues: Cue[]): void {
  for (const cue of cues) {
    if (cue.getStartMs() < 0 || cue.getEndMs() < 0) {
      throw new Error(
        `cue ${cue.getIndex()} has a negative timestamp (start_ms=${cue.getStartMs()}, end_ms=${cue.getEndMs()}); ` +
          'subtitle timestamps cannot be negative',
      );
    }
  }
}

export function errorMessage(e: unknown, context: string): string {
  if (e instanceof Error) return `${context}: ${e.message}`;
  return `${context}: ${String(e)}`;
}

const KNOWN_FORMATS = new Set(['srt', 'vtt', 'ass', 'ssa', 'sbv', 'smi', 'lrc', 'sub', 'json']);

/** Detects a subtitle format from raw content. Thin wrapper over
 * subsrt.detect(); returns "" (undetected) rather than throwing — the
 * library itself never throws from detect().
 *
 * ONE narrow correction is applied ahead of the library's own detect(),
 * for a confirmed gap: subsrt-ts's vtt detect() only matches the bare
 * "WEBVTT\n" form (`/^\s*WEBVTT\r?\n/`, read directly from
 * vendor/subsrt-ts/format/vtt.ts) and does NOT recognize the equally-valid
 * WebVTT-spec form with inline header text on the same line
 * ("WEBVTT Kind: captions\n") — content in that form falls through to
 * srt's own (looser, unanchored) detect regex, which matches a numbered
 * cue followed by a "-->" timing line regardless of the fraction
 * separator used, and gets misclassified as "srt". Verified directly
 * against the vendored source before adding this — see
 * nodes/detect_format_test.ts for the regression case. Every other format
 * detection is untouched and still delegates entirely to subsrt.detect(). */
export function detectFormat(content: string): string {
  if (/^\s*WEBVTT([ \t][^\r\n]*)?\r?\n/.test(content)) return 'vtt';
  return subsrt.detect(content) || '';
}

/** Whether `format` is one of the string tags subsrt-ts recognizes. Used to
 * validate a caller-supplied format hint / to_format before handing it to
 * the library, so an unrecognized value comes back as a structured error
 * instead of the library's own bare TypeError. */
export function isKnownFormat(format: string): boolean {
  return KNOWN_FORMATS.has(format);
}

/** Extracts each WebVTT cue's trailing "settings" text (the text after the
 * second timestamp on a "-->" timing line, e.g. "position:10%,line:0"), in
 * the same left-to-right order cues appear in the source. subsrt-ts's own
 * VTT parser matches this same text as part of its cue-block regex but
 * never captures or exposes it (confirmed by reading vendor/subsrt-ts/
 * format/vtt.ts: the timing-line regex's trailing `.*` is not a capture
 * group) — so this is a second, narrow, cue-settings-only pass over the
 * SAME timing-line shape, not a reimplementation of VTT cue-block parsing
 * (block splitting, multi-line cue text, NOTE detection all stay entirely
 * subsrt-ts's). Cue count/order from this pass is expected to line up 1:1
 * with subsrt-ts's own parsed ContentCaption entries because both derive
 * from the identical set of "-->" timing lines in the same document. */
export function extractVttCueSettings(content: string): string[] {
  const TIMING_LINE =
    /(?:\d{1,2}:)?\d{1,2}:\d{1,2}(?:[.,]\d{1,3})?[ \t]*-->[ \t]*(?:\d{1,2}:)?\d{1,2}:\d{1,2}(?:[.,]\d{1,3})?([ \t]+(\S.*))?$/gm;
  const settings: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = TIMING_LINE.exec(content)) !== null) {
    settings.push((m[2] ?? '').trim());
  }
  return settings;
}

/** Recovers a WebVTT INLINE header ("WEBVTT some text\n", all on one line —
 * valid per the WebVTT spec), which subsrt-ts's own vtt.ts parse() silently
 * drops. Confirmed by reading the vendored source: its meta-block regex
 * tries `/^([A-Z]+)(\r?\n([\s\S]*))?$/` first (the BLOCK-header form,
 * "WEBVTT\n<text>\n", whose text lands in match group 3) and falls back to
 * `/^([A-Z]+)\s+([^\r\n]*)$/` for the inline form — but that fallback's
 * text lands in group 2, and the code only ever reads `meta[3]`, so an
 * inline header is matched but its text is never captured into
 * `caption.data`. This is a narrow, independent re-extraction of exactly
 * that dropped text from the raw content (not a reimplementation of VTT
 * parsing) — returns "" when the header uses the block form (already
 * handled correctly by the library) or is absent entirely. */
function extractVttInlineHeader(content: string): string {
  const m = /^\uFEFF?[ \t]*WEBVTT[ \t]+([^\r\n]*)\r?\n/.exec(content);
  return m ? m[1].trim() : '';
}

/** Converts subsrt-ts's parsed Caption[] into this package's canonical
 * SubtitleDocument. `vttSettings`, when given, is zipped 1:1 onto content
 * cues in order (see extractVttCueSettings) — pass it only when
 * `format === 'vtt'`. Cue.index is assigned as a fresh 1-based running
 * counter over content cues rather than trusting each format's own `.index`
 * (ASS/SSA content captions never set one at all — confirmed by reading
 * vendor/subsrt-ts/format/ssa.ts), so numbering is uniform across formats. */
export function captionsToDocument(captions: Caption[], format: string, vttSettings?: string[]): SubtitleDocument {
  const doc = new SubtitleDocument();
  doc.setFormat(format);
  let cueIndex = 0;
  let settingsIndex = 0;
  for (const raw of captions) {
    if (!raw.type || raw.type === 'caption') {
      const c = raw as ContentCaption;
      cueIndex += 1;
      const cue = new Cue();
      cue.setIndex(cueIndex);
      cue.setStartMs(c.start ?? 0);
      cue.setEndMs(c.end ?? 0);
      cue.setText(c.text ?? '');
      cue.setContent(c.content ?? '');
      if (vttSettings) {
        cue.setSettings(vttSettings[settingsIndex] ?? '');
        settingsIndex += 1;
      }
      if (c.data) {
        const map = cue.getFieldsMap();
        for (const [k, v] of Object.entries(c.data)) map.set(k, String(v));
      }
      doc.addCues(cue);
      continue;
    }
    if (raw.type === 'style') {
      const s = raw as StyleCaption;
      const entry = new StyleEntry();
      const map = entry.getFieldsMap();
      for (const [k, v] of Object.entries(s.data ?? {})) map.set(k, String(v));
      doc.addStyles(entry);
      continue;
    }
    if (raw.type === 'meta') {
      const m = raw as MetaCaption;
      if (m.data && typeof m.data === 'object') {
        // ASS/SSA "Script Info" collapses the whole block into ONE
        // MetaCaption whose .data is a key->value object (confirmed by
        // reading vendor/subsrt-ts/format/ssa.ts) — expand it into one
        // NoteEntry per key so it matches WebVTT's one-block-per-entry shape.
        for (const [k, v] of Object.entries(m.data)) {
          const note = new NoteEntry();
          note.setName(k);
          note.setData(String(v));
          doc.addNotes(note);
        }
        continue;
      }
      const data = typeof m.data === 'string' ? m.data : '';
      if (format === 'vtt' && m.name === 'WEBVTT') {
        doc.setHeader(data);
        continue;
      }
      const note = new NoteEntry();
      note.setName(m.name ?? '');
      note.setData(data);
      doc.addNotes(note);
      continue;
    }
  }
  return doc;
}

/** Parses raw content into this package's canonical SubtitleDocument.
 * `formatHint`, when non-empty, is passed straight to subsrt.parse() as the
 * forced format (skips auto-detection) — used by ParseSrt/ParseWebVtt/
 * ParseAss. Throws BoundsError on oversized input/output and re-throws
 * subsrt-ts's own errors (e.g. "Cannot determine subtitle format")
 * unchanged; callers catch and wrap via errorMessage. */
export function parseToDocument(content: string, formatHint: string): SubtitleDocument {
  const format = formatHint || detectFormat(content);
  if (!format) {
    throw new Error('cannot determine subtitle format from content; pass an explicit format or use DetectFormat first');
  }
  const captions = subsrt.parse(content, { format }) as Caption[];
  const vttSettings = format === 'vtt' ? extractVttCueSettings(content) : undefined;
  const doc = captionsToDocument(captions, format, vttSettings);
  if (format === 'vtt' && !doc.getHeader()) {
    const inlineHeader = extractVttInlineHeader(content);
    if (inlineHeader) doc.setHeader(inlineHeader);
  }
  return doc;
}

/** Converts a SubtitleDocument's cues into subsrt-ts ContentCaption[] for
 * handing to subsrt.build()/subsrt.resync(). Only the fields those library
 * functions actually read are populated (start/end/duration/text/content —
 * confirmed by reading every format's build() in vendor/subsrt-ts/format/:
 * every one of srt/vtt/ssa's build() reads `.text`, never `.content`, for
 * the emitted cue body — so this package's `content` field is informational
 * only and is not what round-trips through the Serialize/Convert nodes). */
export function documentCuesToCaptions(doc: SubtitleDocument): ContentCaption[] {
  return doc.getCuesList().map((cue) => {
    const cap = {} as ContentCaption;
    cap.type = 'caption';
    cap.index = cue.getIndex();
    cap.start = cue.getStartMs();
    cap.end = cue.getEndMs();
    cap.duration = cue.getEndMs() - cue.getStartMs();
    cap.text = cue.getText();
    cap.content = cue.getContent();
    return cap;
  });
}

/** Builds SRT text from a SubtitleDocument via subsrt.build() directly — SRT
 * has no header/notes/styles/cue-settings concept, so nothing this
 * package's SubtitleDocument carries beyond cues is lost by using the
 * library's own builder unmodified. */
export function buildSrt(doc: SubtitleDocument): string {
  checkNonNegativeCues(doc.getCuesList());
  const captions = documentCuesToCaptions(doc);
  return subsrt.build(captions as unknown as Caption[], { format: 'srt' });
}

const CRLF = '\r\n';

/** Builds WebVTT text from a SubtitleDocument, composing structure this
 * package's normalized fields carry — header banner, NOTE/REGION/STYLE
 * blocks, per-cue settings — that subsrt-ts's own vtt build() has no
 * configuration surface to emit (see the file header for why). Per-cue time
 * strings are formatted with the library's OWN exported
 * `format/vtt.ts:helper.toTimeString`, not re-derived here. */
export function buildVtt(doc: SubtitleDocument): string {
  const cues = doc.getCuesList();
  checkNonNegativeCues(cues);
  let out = 'WEBVTT';
  const header = doc.getHeader();
  if (header) {
    out += header.includes('\n') || header.includes('\r') ? CRLF + header : ' ' + header;
  }
  out += CRLF + CRLF;
  for (const note of doc.getNotesList()) {
    out += note.getName() + CRLF;
    if (note.getData()) out += note.getData() + CRLF;
    out += CRLF;
  }
  for (const cue of cues) {
    out += `${vttHelper.toTimeString!(cue.getStartMs())} --> ${vttHelper.toTimeString!(cue.getEndMs())}`;
    const settings = cue.getSettings();
    if (settings) out += ' ' + settings;
    out += CRLF;
    out += cue.getText() + CRLF + CRLF;
  }
  return out;
}

const ASS_V4_PLUS_COLUMNS = [
  'Name', 'Fontname', 'Fontsize', 'PrimaryColour', 'SecondaryColour', 'OutlineColour', 'BackColour',
  'Bold', 'Italic', 'Underline', 'StrikeOut', 'ScaleX', 'ScaleY', 'Spacing', 'Angle', 'BorderStyle',
  'Outline', 'Shadow', 'Alignment', 'MarginL', 'MarginR', 'MarginV', 'Encoding',
];
const ASS_V4_COLUMNS = [
  'Name', 'Fontname', 'Fontsize', 'PrimaryColour', 'SecondaryColour', 'TertiaryColour', 'BackColour',
  'Bold', 'Italic', 'BorderStyle', 'Outline', 'Shadow', 'Alignment', 'MarginL', 'MarginR', 'MarginV',
  'AlphaLevel', 'Encoding',
];
const ASS_V4_PLUS_DEFAULT_STYLE =
  'DefaultVCD,Arial,28,&H00B4FCFC,&H00B4FCFC,&H00000008,&H80000008,-1,0,0,0,100,100,0.00,0.00,1,1.00,2.00,2,30,30,30,0';
const ASS_V4_DEFAULT_STYLE = 'DefaultVCD,Arial,28,11861244,11861244,11861244,-2147483640,-1,0,1,1,2,2,30,30,30,0,0';
const ASS_DEFAULT_SCRIPT_INFO: [string, string][] = [
  ['; Script generated by', 'christiangeorgelucas/subtitle-tools'],
  ['Collisions', 'Normal'],
];

/** Builds ASS or SSA text from a SubtitleDocument, composing the [Script
 * Info]/[V4(+) Styles] blocks from this package's `notes`/`styles` fields —
 * subsrt-ts's own ssa/ass build() hardcodes ONE fixed default Script
 * Info/Style regardless of input (confirmed by reading vendor/subsrt-ts/
 * format/ssa.ts: build() never reads a `style`-typed or `meta`-typed
 * caption at all) — falling back to that same library default when the
 * document has no notes/styles of its own, so a document that was never
 * parsed from ASS/SSA (e.g. one built by hand, or converted from SRT/VTT)
 * still serializes to a valid file. Per-cue time strings are formatted with
 * the library's OWN exported `format/ssa.ts:helper.toTimeString`. `isAss`
 * selects "ScriptType: v4.00+"/[V4+ Styles] (true) vs "v4.00"/[V4 Styles]
 * (false), matching subsrt-ts's own ass-vs-ssa distinction. */
export function buildAss(doc: SubtitleDocument, isAss: boolean): string {
  const cues = doc.getCuesList();
  checkNonNegativeCues(cues);
  const columns = isAss ? ASS_V4_PLUS_COLUMNS : ASS_V4_COLUMNS;
  const defaultStyle = isAss ? ASS_V4_PLUS_DEFAULT_STYLE : ASS_V4_DEFAULT_STYLE;

  let out = '[Script Info]' + CRLF;
  const notes = doc.getNotesList();
  if (notes.length > 0) {
    for (const n of notes) out += `${n.getName()}: ${n.getData()}` + CRLF;
  } else {
    out += `ScriptType: v4.00${isAss ? '+' : ''}` + CRLF;
    for (const [k, v] of ASS_DEFAULT_SCRIPT_INFO) out += `${k}: ${v}` + CRLF;
  }
  out += CRLF;

  out += `[${isAss ? 'V4+' : 'V4'} Styles]` + CRLF;
  out += `Format: ${columns.join(', ')}` + CRLF;
  const styles = doc.getStylesList();
  if (styles.length > 0) {
    for (const s of styles) {
      const map = s.getFieldsMap();
      out += 'Style: ' + columns.map((c) => map.get(c) ?? '').join(',') + CRLF;
    }
  } else {
    out += 'Style: ' + defaultStyle + CRLF;
  }
  out += CRLF;

  out += '[Events]' + CRLF;
  out += `Format: ${isAss ? 'Layer' : 'Marked'}, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text` + CRLF;
  for (const cue of cues) {
    const fields = cue.getFieldsMap();
    const layer = isAss ? fields.get('Layer') ?? '0' : `Marked=${fields.get('Marked') ?? '0'}`;
    const style = fields.get('Style') ?? 'DefaultVCD';
    const name = fields.get('Name') ?? '';
    const marginL = fields.get('MarginL') ?? '0000';
    const marginR = fields.get('MarginR') ?? '0000';
    const marginV = fields.get('MarginV') ?? '0000';
    const effect = fields.get('Effect') ?? '';
    const text = cue.getText().replace(/\r?\n/g, '\\N');
    out +=
      `Dialogue: ${layer},${ssaHelper.toTimeString!(cue.getStartMs())},${ssaHelper.toTimeString!(cue.getEndMs())},` +
      `${style},${name},${marginL},${marginR},${marginV},${effect},${text}` + CRLF;
  }
  return out;
}

/** Shifts and/or scales every cue's timing via subsrt.resync() itself (not
 * reimplemented here) — converts cues to ContentCaption[], calls the
 * library, then writes the resynced start/end back onto clones of the
 * original Cue protos (preserving text/content/settings/fields, which
 * resync never touches). `offsetMs` alone -> subsrt.resync(captions,
 * offsetMs); `ratio` alone or with `offsetMs` -> subsrt.resync(captions,
 * {offset: offsetMs, ratio}), matching the library's own two call shapes.
 *
 * Rejects (throws) if the result would contain a negative start_ms/end_ms
 * — subsrt.resync() itself performs no such check (confirmed by reading
 * vendor/subsrt-ts/subsrt.ts: `resync`'s shift function is unconditional
 * arithmetic), and a negative timestamp reaching a Serialize node would
 * otherwise silently produce corrupted, unparseable output text under
 * `ok: true` (every format's time-string formatter does no negative-number
 * handling — see checkNonNegativeCues). Failing here, at the point the
 * caller's offset/factor actually produced the bad value, is more useful
 * than only catching it later in Serialize. */
export function resyncCues(doc: SubtitleDocument, offsetMs: number, ratio?: number): Cue[] {
  const captions = documentCuesToCaptions(doc) as unknown as Caption[];
  const resynced =
    ratio === undefined
      ? subsrt.resync(captions, offsetMs)
      : subsrt.resync(captions, { offset: offsetMs, ratio });
  const originals = doc.getCuesList();
  const out = resynced.map((r, i) => {
    const rc = r as ContentCaption;
    const clone = originals[i].cloneMessage() as Cue;
    clone.setStartMs(rc.start);
    clone.setEndMs(rc.end);
    return clone;
  });
  checkNonNegativeCues(out);
  return out;
}

/** Renumbers each cue's leading sequence-number line to a sequential 1..N,
 * for SRT/WebVTT output text. Fixes a confirmed subsrt-ts bug: srt.ts and
 * vtt.ts's own build() functions number each cue by its RAW ARRAY POSITION
 * in the full parsed captions array (`(i + 1).toString()`, read directly
 * from both files) — which includes non-cue entries (WebVTT NOTE/REGION
 * meta captions, ASS/SSA Script-Info meta and Style captions) ahead of the
 * actual content captions in that array. So converting FROM a format that
 * carries any such entries (any real-world ASS/SSA file always has at
 * least one Style; a WebVTT file often has a NOTE) inflates every
 * downstream SRT/WebVTT cue number by the count of those entries — e.g.
 * one Script Info block + one Style before a single Dialogue line numbers
 * that cue "3" instead of "1". Verified directly against the vendored
 * source and reproduced in nodes/convert_web_vtt_to_srt_test.ts and
 * nodes/convert_format_test.ts before adding this fix. This is a
 * text-level post-processing pass — a regex match anchored on "a digit
 * line immediately followed by a valid timing line" — not a
 * reimplementation of SRT/VTT parsing or building. */
function renumberSequenceLines(content: string): string {
  let n = 0;
  return content.replace(
    /^\d+(\r?\n(?:\d{1,2}:)?\d{1,2}:\d{1,2}[.,]\d{1,3}\s*-->\s*(?:\d{1,2}:)?\d{1,2}:\d{1,2}[.,]\d{1,3})/gm,
    (_m, rest) => {
      n += 1;
      return `${n}${rest}`;
    },
  );
}

/** Converts raw subtitle text from one format to another via subsrt.convert()
 * directly — a single library call (parse then build internally), not
 * round-tripped through this package's SubtitleDocument type. That is a
 * deliberate choice, not a shortcut: the source text never had this
 * package's header/notes/styles/cue-settings extensions surfaced to begin
 * with (they only exist once parsed into a SubtitleDocument by ParseWebVtt/
 * ParseAss), so calling the library's own convert() end-to-end is both
 * simpler and exactly as faithful as this package's own parse+build path
 * would be for two raw-text-in, raw-text-out formats. `fromFormat` empty
 * means auto-detect (subsrt.convert's own behavior). Throws on an unknown
 * `toFormat` or undetectable `fromFormat`; callers catch and wrap. */
export function convertContent(content: string, fromFormat: string, toFormat: string): string {
  if (!isKnownFormat(toFormat)) {
    throw new Error(`unsupported target format: "${toFormat}"`);
  }
  if (fromFormat && !isKnownFormat(fromFormat)) {
    throw new Error(`unsupported source format: "${fromFormat}"`);
  }
  const options = fromFormat ? { from: fromFormat, to: toFormat } : { to: toFormat };
  const result = subsrt.convert(content, options as Parameters<typeof subsrt.convert>[1]);
  return toFormat === 'srt' || toFormat === 'vtt' ? renumberSequenceLines(result) : result;
}

/** Deep-clones a SubtitleDocument's scalar/header fields plus a caller-
 * supplied cues list, leaving notes/styles as-is (untouched by any
 * timing/text transform in this package). */
export function withCues(doc: SubtitleDocument, cues: Cue[]): SubtitleDocument {
  const out = new SubtitleDocument();
  out.setFormat(doc.getFormat());
  out.setHeader(doc.getHeader());
  out.setNotesList(doc.getNotesList());
  out.setStylesList(doc.getStylesList());
  out.setCuesList(cues);
  return out;
}
