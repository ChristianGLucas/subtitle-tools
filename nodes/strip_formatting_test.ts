import { stripFormatting } from './strip_formatting';
import { ctx, makeCue, makeDocument } from './testkit';

describe('StripFormatting', () => {
  it('overwrites content with the already-cleaned text field', () => {
    const doc = makeDocument({
      format: 'vtt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'Hello world', content: 'Hello <i>world</i>' }),
        makeCue({ index: 2, startMs: 1000, endMs: 2000, text: 'plain', content: 'plain' }),
      ],
    });
    const result = stripFormatting(ctx, doc);
    expect(result.getOk()).toBe(true);
    const cues = result.getDocument()!.getCuesList();
    expect(cues[0].getContent()).toBe('Hello world');
    expect(cues[0].getText()).toBe('Hello world'); // text untouched
    expect(cues[1].getContent()).toBe('plain');
  });

  it('does not alter timing or index', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 100, endMs: 200, text: 'x', content: '<b>x</b>' })],
    });
    const result = stripFormatting(ctx, doc);
    const cue = result.getDocument()!.getCuesList()[0];
    expect(cue.getStartMs()).toBe(100);
    expect(cue.getEndMs()).toBe(200);
    expect(cue.getIndex()).toBe(1);
  });
});
