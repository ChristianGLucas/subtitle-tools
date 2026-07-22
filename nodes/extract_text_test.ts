import { extractText } from './extract_text';
import { ctx, makeCue, makeDocument } from './testkit';

describe('ExtractText', () => {
  it('joins cue text in order, separated by a blank line', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'First cue' }),
        makeCue({ index: 2, startMs: 2000, endMs: 3000, text: 'Second cue' }),
        makeCue({ index: 3, startMs: 4000, endMs: 5000, text: 'Third cue' }),
      ],
    });
    const result = extractText(ctx, doc);
    expect(result.getOk()).toBe(true);
    expect(result.getText()).toBe('First cue\n\nSecond cue\n\nThird cue');
  });

  it('returns an empty string for a document with no cues', () => {
    const doc = makeDocument({ format: 'srt', cues: [] });
    const result = extractText(ctx, doc);
    expect(result.getOk()).toBe(true);
    expect(result.getText()).toBe('');
  });

  it('does not include timing or markup — only the cleaned text field', () => {
    const doc = makeDocument({
      format: 'vtt',
      cues: [makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'clean', content: '<i>clean</i>' })],
    });
    const result = extractText(ctx, doc);
    expect(result.getText()).toBe('clean');
    expect(result.getText()).not.toContain('<i>');
  });
});
