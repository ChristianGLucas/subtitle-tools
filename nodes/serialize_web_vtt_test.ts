import { RawSubtitle } from '../gen/messages_pb';
import { serializeWebVtt } from './serialize_web_vtt';
import { parseWebVtt } from './parse_web_vtt';
import { ctx, makeCue, makeDocument } from './testkit';

describe('SerializeWebVtt', () => {
  it('reconstructs header, NOTE block, and cue settings that ParseWebVtt would have captured', () => {
    const doc = makeDocument({
      format: 'vtt',
      header: 'Kind: captions; Language: en',
      notes: [{ name: 'NOTE', data: 'This is a comment block.' }],
      cues: [
        makeCue({
          index: 1,
          startMs: 1000,
          endMs: 4000,
          text: 'Hello world',
          settings: 'position:10%,line:0,align:start',
        }),
      ],
    });
    const result = serializeWebVtt(ctx, doc);
    expect(result.getOk()).toBe(true);
    const subtitle = result.getSubtitle()!;
    expect(subtitle.getFormat()).toBe('vtt');
    const content = subtitle.getContent();
    expect(content).toContain('WEBVTT Kind: captions; Language: en');
    expect(content).toContain('NOTE\r\nThis is a comment block.');
    // Hand-verified: 1000ms -> 00:00:01.000 ; 4000ms -> 00:00:04.000.
    expect(content).toContain('00:00:01.000 --> 00:00:04.000 position:10%,line:0,align:start');
    expect(content).toContain('Hello world');
  });

  it('serializes a plain document (no header/notes/settings) to a minimal valid WebVTT file', () => {
    const doc = makeDocument({
      format: 'vtt',
      cues: [makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'Hi' })],
    });
    const result = serializeWebVtt(ctx, doc);
    expect(result.getOk()).toBe(true);
    const content = result.getSubtitle()!.getContent();
    expect(content.startsWith('WEBVTT\r\n\r\n')).toBe(true);
    expect(content).toContain('00:00:00.000 --> 00:00:01.000');
  });

  it('round-trips through ParseWebVtt for header/settings/text', () => {
    const doc = makeDocument({
      format: 'vtt',
      header: 'roundtrip header',
      cues: [makeCue({ index: 1, startMs: 5000, endMs: 7000, text: 'text', settings: 'line:1' })],
    });
    const serialized = serializeWebVtt(ctx, doc);
    const raw = new RawSubtitle();
    raw.setContent(serialized.getSubtitle()!.getContent());
    const reparsed = parseWebVtt(ctx, raw);
    expect(reparsed.getOk()).toBe(true);
    const redoc = reparsed.getDocument()!;
    expect(redoc.getHeader()).toBe('roundtrip header');
    expect(redoc.getCuesList()[0].getStartMs()).toBe(5000);
    expect(redoc.getCuesList()[0].getSettings()).toBe('line:1');
  });

  it('rejects a document over the cue-count bound with a structured error, not a crash', () => {
    const cues = Array.from({ length: 20_001 }, (_, i) =>
      makeCue({ index: i + 1, startMs: i * 1000, endMs: i * 1000 + 500, text: 'x' }),
    );
    const result = serializeWebVtt(ctx, makeDocument({ format: 'vtt', cues }));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });

  it('REGRESSION (found by adversarial review): rejects a document with a negative timestamp rather than emitting corrupted output', () => {
    const doc = makeDocument({
      format: 'vtt',
      cues: [makeCue({ index: 1, startMs: -900, endMs: -500, text: 'a' })],
    });
    const result = serializeWebVtt(ctx, doc);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/negative timestamp/i);
  });
});
