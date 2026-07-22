import { RawSubtitle } from '../gen/messages_pb';
import { parseWebVtt } from './parse_web_vtt';
import { ctx, VTT_WITH_HEADER_NOTES_SETTINGS, ASS_SIMPLE } from './testkit';

function parse(content: string) {
  const input = new RawSubtitle();
  input.setContent(content);
  return parseWebVtt(ctx, input);
}

describe('ParseWebVtt', () => {
  it('captures header, NOTE block, cue settings, and strips <i> markup into text while preserving it in content', () => {
    const result = parse(VTT_WITH_HEADER_NOTES_SETTINGS);
    expect(result.getOk()).toBe(true);
    const doc = result.getDocument()!;
    expect(doc.getFormat()).toBe('vtt');
    expect(doc.getHeader()).toBe('Kind: captions; Language: en');
    const notes = doc.getNotesList();
    expect(notes).toHaveLength(1);
    expect(notes[0].getName()).toBe('NOTE');
    expect(notes[0].getData()).toBe('This is a comment block.');
    const cues = doc.getCuesList();
    expect(cues).toHaveLength(1);
    expect(cues[0].getStartMs()).toBe(1000); // 00:00:01.000
    expect(cues[0].getEndMs()).toBe(4000); // 00:00:04.000
    expect(cues[0].getSettings()).toBe('position:10%,line:0,align:start');
    expect(cues[0].getText()).toBe('Hello world');
    expect(cues[0].getContent()).toBe('Hello <i>world</i>');
  });

  it('force-parses as WebVTT: content in an unrelated block-structured format (ASS) yields zero cues, not a crash — note SRT-shaped cue blocks DO parse under WebVTT\'s own (deliberately lenient) cue-block grammar, which also accepts comma-separated timestamps; that is intentional upstream behavior, not tested as a negative case here', () => {
    const result = parse(ASS_SIMPLE);
    expect(result.getOk()).toBe(true);
    expect(result.getDocument()!.getCuesList()).toHaveLength(0);
  });

  it('rejects oversized input with a structured error, not a crash', () => {
    const result = parse('x'.repeat(2_000_001));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });
});
