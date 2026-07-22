import { RawSubtitle } from '../gen/messages_pb';
import { parseSrt } from './parse_srt';
import { ctx, SRT_SIMPLE, VTT_WITH_HEADER_NOTES_SETTINGS } from './testkit';

function parse(content: string) {
  const input = new RawSubtitle();
  input.setContent(content);
  return parseSrt(ctx, input);
}

describe('ParseSrt', () => {
  it('parses SRT with hand-computed millisecond timings', () => {
    const result = parse(SRT_SIMPLE);
    expect(result.getOk()).toBe(true);
    const doc = result.getDocument()!;
    expect(doc.getFormat()).toBe('srt');
    const cues = doc.getCuesList();
    expect(cues).toHaveLength(2);
    expect(cues[0].getStartMs()).toBe(1000);
    expect(cues[0].getEndMs()).toBe(2500);
    expect(cues[1].getStartMs()).toBe(3000);
    expect(cues[1].getEndMs()).toBe(5250);
  });

  it('force-parses as SRT regardless of what the content actually is: WebVTT content does not match SRT cue grammar, so this returns zero cues, not a crash and not a misleading result', () => {
    const result = parse(VTT_WITH_HEADER_NOTES_SETTINGS);
    expect(result.getOk()).toBe(true);
    expect(result.getDocument()!.getCuesList()).toHaveLength(0);
  });

  it('rejects oversized input with a structured error, not a crash', () => {
    const result = parse('x'.repeat(2_000_001));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });
});
