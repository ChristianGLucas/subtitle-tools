import { RawSubtitle } from '../gen/messages_pb';
import { parseAss } from './parse_ass';
import { ctx, ASS_SIMPLE, SRT_SIMPLE } from './testkit';

function parse(content: string) {
  const input = new RawSubtitle();
  input.setContent(content);
  return parseAss(ctx, input);
}

describe('ParseAss', () => {
  it('captures Script Info notes, style definitions, and dialogue with hand-computed centisecond timings', () => {
    const result = parse(ASS_SIMPLE);
    expect(result.getOk()).toBe(true);
    const doc = result.getDocument()!;
    expect(doc.getFormat()).toBe('ass'); // detected via "[V4+ Styles]"

    const notes = doc.getNotesList();
    const titleNote = notes.find((n) => n.getName() === 'Title');
    expect(titleNote?.getData()).toBe('Test Script');

    const styles = doc.getStylesList();
    expect(styles).toHaveLength(1);
    expect(styles[0].getFieldsMap().get('Name')).toBe('Default');
    expect(styles[0].getFieldsMap().get('Fontname')).toBe('Arial');

    const cues = doc.getCuesList();
    expect(cues).toHaveLength(1);
    // 0:00:01.00 -> 1*1000 = 1000 ; 0:00:03.50 -> 3*1000 + 50*10 = 3500
    expect(cues[0].getStartMs()).toBe(1000);
    expect(cues[0].getEndMs()).toBe(3500);
    expect(cues[0].getText()).toBe('Hello ASS world');
    expect(cues[0].getFieldsMap().get('Style')).toBe('Default');
  });

  it('detects the SSA dialect ("[V4 Styles]") distinctly from ASS', () => {
    const ssaContent =
      '[Script Info]\r\nScriptType: v4.00\r\n\r\n' +
      '[V4 Styles]\r\n' +
      'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, AlphaLevel, Encoding\r\n' +
      'Style: Default,Arial,20,11861244,11861244,11861244,-2147483640,-1,0,1,1,2,2,10,10,10,0,0\r\n\r\n' +
      '[Events]\r\n' +
      'Format: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\r\n' +
      'Dialogue: Marked=0,0:00:02.00,0:00:04.00,Default,,0000,0000,0000,,SSA dialect line\r\n';
    const result = parse(ssaContent);
    expect(result.getOk()).toBe(true);
    expect(result.getDocument()!.getFormat()).toBe('ssa');
    expect(result.getDocument()!.getCuesList()[0].getStartMs()).toBe(2000);
  });

  it('force-parses as ASS/SSA: content lacking "[Script Info]"/"[Events]" yields zero cues, not a crash', () => {
    const result = parse(SRT_SIMPLE);
    expect(result.getOk()).toBe(true);
    expect(result.getDocument()!.getCuesList()).toHaveLength(0);
  });

  it('rejects oversized input with a structured error, not a crash', () => {
    const result = parse('x'.repeat(2_000_001));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });
});
