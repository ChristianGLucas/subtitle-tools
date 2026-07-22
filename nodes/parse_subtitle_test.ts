import { RawSubtitle } from '../gen/messages_pb';
import { parseSubtitle } from './parse_subtitle';
import { ctx, SRT_SIMPLE, VTT_WITH_HEADER_NOTES_SETTINGS } from './testkit';

function parse(content: string, format = '') {
  const input = new RawSubtitle();
  input.setContent(content);
  input.setFormat(format);
  return parseSubtitle(ctx, input);
}

describe('ParseSubtitle', () => {
  it('auto-detects and parses SRT, with hand-computed millisecond timings', () => {
    const result = parse(SRT_SIMPLE);
    expect(result.getOk()).toBe(true);
    const doc = result.getDocument()!;
    expect(doc.getFormat()).toBe('srt');
    const cues = doc.getCuesList();
    expect(cues).toHaveLength(2);
    expect(cues[0].getIndex()).toBe(1);
    expect(cues[0].getStartMs()).toBe(1000);
    expect(cues[0].getEndMs()).toBe(2500);
    expect(cues[0].getText()).toBe('Hello world');
    expect(cues[1].getStartMs()).toBe(3000);
    expect(cues[1].getEndMs()).toBe(5250);
    expect(cues[1].getText()).toBe('Second line');
  });

  it('auto-detects and parses WebVTT, capturing header/notes/settings', () => {
    const result = parse(VTT_WITH_HEADER_NOTES_SETTINGS);
    expect(result.getOk()).toBe(true);
    const doc = result.getDocument()!;
    expect(doc.getFormat()).toBe('vtt');
    expect(doc.getHeader()).toBe('Kind: captions; Language: en');
    expect(doc.getNotesList()).toHaveLength(1);
    expect(doc.getNotesList()[0].getName()).toBe('NOTE');
    expect(doc.getNotesList()[0].getData()).toBe('This is a comment block.');
    const cues = doc.getCuesList();
    expect(cues).toHaveLength(1);
    expect(cues[0].getStartMs()).toBe(1000);
    expect(cues[0].getEndMs()).toBe(4000);
    expect(cues[0].getText()).toBe('Hello world'); // <i> stripped from text
    expect(cues[0].getContent()).toBe('Hello <i>world</i>'); // markup intact in content
    expect(cues[0].getSettings()).toBe('position:10%,line:0,align:start');
  });

  it('respects an explicit format hint over auto-detection', () => {
    // SRT_SIMPLE forced as "srt" explicitly should behave identically to auto-detect.
    const result = parse(SRT_SIMPLE, 'srt');
    expect(result.getOk()).toBe(true);
    expect(result.getDocument()!.getCuesList()).toHaveLength(2);
  });

  it('fails with a structured error when the format cannot be determined', () => {
    const result = parse('this is not a subtitle file in any known format');
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/cannot determine subtitle format/i);
  });

  it('rejects oversized input with a structured error, not a crash', () => {
    const result = parse('x'.repeat(2_000_001));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });
});
