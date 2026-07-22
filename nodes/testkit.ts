// Shared test context and hand-crafted fixtures for subtitle-tools node unit
// tests. Not a node and not a test file (no describe/it), so it is neither
// registered as a node nor collected by jest.
import { AxiomContext, AxiomLogger, AxiomSecrets, AxiomReflection, AxiomMutation } from '../gen/axiomContext';
import { Cue, NoteEntry, StyleEntry, SubtitleDocument } from '../gen/messages_pb';

const reflection: AxiomReflection = {
  flow: {
    nodes: [],
    edges: [],
    loopEdges: [],
    position: { currentInstance: 0, depth: 0, loopIterations: {}, subflowStackGraphIds: [] },
    graphId: '',
  },
};

const mutation: AxiomMutation = {
  flow: {
    addNode: (_p: string, _v: string) => 0,
    addEdge: (_s: number, _d: number) => {},
  },
};

export const ctx: AxiomContext = {
  log: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} } satisfies AxiomLogger,
  secrets: { get: (_n: string): [string, boolean] => ['', false] } satisfies AxiomSecrets,
  executionId: 'test-execution-id',
  flowId: 'test-flow-id',
  tenantId: 'test-tenant-id',
  reflection,
  mutation,
};

// INDEPENDENT ORACLE — every millisecond value below is hand-computed from
// the timestamp text by the same arithmetic the SRT/WebVTT/ASS format specs
// define (hh*3600000 + mm*60000 + ss*1000 + fraction), not by running this
// package's code or subsrt-ts. Agreement is evidence the wrapped library (and
// this package's use of it) actually implements the format, not merely that
// it agrees with itself.
//
// SRT_SIMPLE: two cues, hand-computed:
//   00:00:01,000 -> 1*1000             = 1000
//   00:00:02,500 -> 2*1000 + 500        = 2500
//   00:00:03,000 -> 3*1000              = 3000
//   00:00:05,250 -> 5*1000 + 250        = 5250
export const SRT_SIMPLE =
  '1\r\n00:00:01,000 --> 00:00:02,500\r\nHello world\r\n\r\n' +
  '2\r\n00:00:03,000 --> 00:00:05,250\r\nSecond line\r\n\r\n';

// VTT_WITH_HEADER_NOTES_SETTINGS: header banner text, a NOTE block, and a
// cue with positioning settings + <i> markup.
//   00:00:01.000 -> 1000
//   00:00:04.000 -> 4000
export const VTT_WITH_HEADER_NOTES_SETTINGS =
  'WEBVTT Kind: captions; Language: en\r\n\r\n' +
  'NOTE\r\nThis is a comment block.\r\n\r\n' +
  '1\r\n00:00:01.000 --> 00:00:04.000 position:10%,line:0,align:start\r\n' +
  'Hello <i>world</i>\r\n\r\n';

// ASS_SIMPLE: [Script Info] with one custom field, one Style, one Dialogue.
//   0:00:01.00 -> 1*1000 + 0*10          = 1000
//   0:00:03.50 -> 3*1000 + 50*10         = 3500
export const ASS_SIMPLE =
  '[Script Info]\r\n' +
  'Title: Test Script\r\n' +
  'ScriptType: v4.00+\r\n\r\n' +
  '[V4+ Styles]\r\n' +
  'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\r\n' +
  'Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1\r\n\r\n' +
  '[Events]\r\n' +
  'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\r\n' +
  'Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0000,0000,0000,,Hello ASS world\r\n';

/** Builds a Cue directly (for tests of nodes that take a SubtitleDocument,
 * where round-tripping through a Parse* node first would be indirection). */
export function makeCue(opts: {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
  content?: string;
  settings?: string;
  fields?: Record<string, string>;
}): Cue {
  const c = new Cue();
  c.setIndex(opts.index);
  c.setStartMs(opts.startMs);
  c.setEndMs(opts.endMs);
  c.setText(opts.text);
  c.setContent(opts.content ?? opts.text);
  c.setSettings(opts.settings ?? '');
  if (opts.fields) {
    const map = c.getFieldsMap();
    for (const [k, v] of Object.entries(opts.fields)) map.set(k, v);
  }
  return c;
}

/** Builds a SubtitleDocument directly from cues plus optional header/notes/
 * styles-as-plain-objects, for tests of the Serialize and transform nodes. */
export function makeDocument(opts: {
  format: string;
  cues: Cue[];
  header?: string;
  notes?: { name: string; data: string }[];
  styles?: Record<string, string>[];
}): SubtitleDocument {
  const doc = new SubtitleDocument();
  doc.setFormat(opts.format);
  doc.setCuesList(opts.cues);
  doc.setHeader(opts.header ?? '');
  doc.setNotesList(
    (opts.notes ?? []).map((n) => {
      const note = new NoteEntry();
      note.setName(n.name);
      note.setData(n.data);
      return note;
    }),
  );
  doc.setStylesList(
    (opts.styles ?? []).map((fields) => {
      const s = new StyleEntry();
      const map = s.getFieldsMap();
      for (const [k, v] of Object.entries(fields)) map.set(k, v);
      return s;
    }),
  );
  return doc;
}
