import { RawSubtitle } from '../gen/messages_pb';
import { serializeAss } from './serialize_ass';
import { parseAss } from './parse_ass';
import { ctx, makeCue, makeDocument } from './testkit';

describe('SerializeAss', () => {
  it('reconstructs Script Info and Styles from the document, using "[V4+ Styles]" for format "ass"', () => {
    const doc = makeDocument({
      format: 'ass',
      notes: [{ name: 'Title', data: 'My Show' }],
      styles: [{ Name: 'Default', Fontname: 'Arial', Fontsize: '20' }],
      cues: [
        makeCue({
          index: 1,
          startMs: 1000,
          endMs: 3500,
          text: 'Hello ASS world',
          fields: { Style: 'Default' },
        }),
      ],
    });
    const result = serializeAss(ctx, doc);
    expect(result.getOk()).toBe(true);
    const subtitle = result.getSubtitle()!;
    expect(subtitle.getFormat()).toBe('ass');
    const content = subtitle.getContent();
    expect(content).toContain('[V4+ Styles]');
    expect(content).toContain('Title: My Show');
    // Hand-verified: 1000ms -> 0:00:01.00 ; 3500ms -> 0:00:03.50 (centiseconds).
    expect(content).toContain('0:00:01.00,0:00:03.50');
    expect(content).toContain('Hello ASS world');
  });

  it('falls back to the standard default Script Info/Style when the document has none of its own (e.g. converted from SRT)', () => {
    const doc = makeDocument({
      format: 'ass',
      cues: [makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'Hi' })],
    });
    const result = serializeAss(ctx, doc);
    expect(result.getOk()).toBe(true);
    const content = result.getSubtitle()!.getContent();
    expect(content).toContain('ScriptType: v4.00+');
    expect(content).toContain('Style: DefaultVCD');
  });

  it('uses "[V4 Styles]"/SSA dialect when format is not "ass"', () => {
    const doc = makeDocument({
      format: 'ssa',
      cues: [makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'Hi' })],
    });
    const result = serializeAss(ctx, doc);
    expect(result.getSubtitle()!.getFormat()).toBe('ssa');
    expect(result.getSubtitle()!.getContent()).toContain('[V4 Styles]');
  });

  it('round-trips through ParseAss for styles/text/timing', () => {
    const doc = makeDocument({
      format: 'ass',
      styles: [{ Name: 'Default', Fontname: 'Arial', Fontsize: '20' }],
      cues: [makeCue({ index: 1, startMs: 2000, endMs: 4500, text: 'roundtrip' })],
    });
    const serialized = serializeAss(ctx, doc);
    const raw = new RawSubtitle();
    raw.setContent(serialized.getSubtitle()!.getContent());
    const reparsed = parseAss(ctx, raw);
    expect(reparsed.getOk()).toBe(true);
    const redoc = reparsed.getDocument()!;
    expect(redoc.getStylesList()[0].getFieldsMap().get('Name')).toBe('Default');
    expect(redoc.getCuesList()[0].getStartMs()).toBe(2000);
    expect(redoc.getCuesList()[0].getEndMs()).toBe(4500);
    expect(redoc.getCuesList()[0].getText()).toBe('roundtrip');
  });

  it('rejects a document over the cue-count bound with a structured error, not a crash', () => {
    const cues = Array.from({ length: 20_001 }, (_, i) =>
      makeCue({ index: i + 1, startMs: i * 1000, endMs: i * 1000 + 500, text: 'x' }),
    );
    const result = serializeAss(ctx, makeDocument({ format: 'ass', cues }));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });

  it('REGRESSION (found by adversarial review): rejects a document with a negative timestamp rather than emitting corrupted output', () => {
    const doc = makeDocument({
      format: 'ass',
      cues: [makeCue({ index: 1, startMs: -900, endMs: -500, text: 'a' })],
    });
    const result = serializeAss(ctx, doc);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/negative timestamp/i);
  });
});
