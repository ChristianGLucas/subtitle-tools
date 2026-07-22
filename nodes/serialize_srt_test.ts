import { RawSubtitle } from '../gen/messages_pb';
import { serializeSrt } from './serialize_srt';
import { parseSrt } from './parse_srt';
import { ctx, makeCue, makeDocument } from './testkit';

describe('SerializeSrt', () => {
  it('serializes to well-formed SRT text with hand-verified timestamp formatting', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 1000, endMs: 2500, text: 'Hello world' }),
        makeCue({ index: 2, startMs: 3000, endMs: 5250, text: 'Second line' }),
      ],
    });
    const result = serializeSrt(ctx, doc);
    expect(result.getOk()).toBe(true);
    const subtitle = result.getSubtitle()!;
    expect(subtitle.getFormat()).toBe('srt');
    // Hand-verified: 1000ms -> 00:00:01,000 ; 2500ms -> 00:00:02,500.
    expect(subtitle.getContent()).toBe(
      '1\r\n00:00:01,000 --> 00:00:02,500\r\nHello world\r\n\r\n' +
        '2\r\n00:00:03,000 --> 00:00:05,250\r\nSecond line\r\n\r\n',
    );
  });

  it('round-trips through ParseSrt: parse(serialize(doc)) reproduces the same cue timings/text', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 61_500, endMs: 63_000, text: 'Round trip check' })],
    });
    const serialized = serializeSrt(ctx, doc);
    expect(serialized.getOk()).toBe(true);
    const raw = new RawSubtitle();
    raw.setContent(serialized.getSubtitle()!.getContent());
    const reparsed = parseSrt(ctx, raw);
    expect(reparsed.getOk()).toBe(true);
    const cues = reparsed.getDocument()!.getCuesList();
    expect(cues).toHaveLength(1);
    expect(cues[0].getStartMs()).toBe(61_500);
    expect(cues[0].getEndMs()).toBe(63_000);
    expect(cues[0].getText()).toBe('Round trip check');
  });

  it('rejects a document over the cue-count bound with a structured error, not a crash', () => {
    const cues = Array.from({ length: 20_001 }, (_, i) =>
      makeCue({ index: i + 1, startMs: i * 1000, endMs: i * 1000 + 500, text: 'x' }),
    );
    const doc = makeDocument({ format: 'srt', cues });
    const result = serializeSrt(ctx, doc);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });

  it('REGRESSION (found by adversarial review): rejects a document with a negative timestamp rather than emitting corrupted output — defense in depth for a document built by other means than ShiftTiming (e.g. hand-constructed flow input)', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: -900, endMs: -500, text: 'a' })],
    });
    const result = serializeSrt(ctx, doc);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/negative timestamp/i);
  });
});
