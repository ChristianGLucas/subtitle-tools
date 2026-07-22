import { fixCommonIssues } from './fix_common_issues';
import { validateSubtitle } from './validate_subtitle';
import { ctx, makeCue, makeDocument } from './testkit';

describe('FixCommonIssues', () => {
  it('sorts cues by start_ms and renumbers', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 5000, endMs: 6000, text: 'later' }),
        makeCue({ index: 2, startMs: 0, endMs: 1000, text: 'earlier' }),
      ],
    });
    const result = fixCommonIssues(ctx, doc);
    expect(result.getOk()).toBe(true);
    const cues = result.getDocument()!.getCuesList();
    expect(cues.map((c) => c.getText())).toEqual(['earlier', 'later']);
    expect(cues.map((c) => c.getIndex())).toEqual([1, 2]);
  });

  it('clamps a zero/negative-duration cue to a minimum 1ms duration (hand-computed: end_ms = start_ms + 1)', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 1000, endMs: 900, text: 'bad' })],
    });
    const result = fixCommonIssues(ctx, doc);
    const cue = result.getDocument()!.getCuesList()[0];
    expect(cue.getStartMs()).toBe(1000);
    expect(cue.getEndMs()).toBe(1001);
  });

  it('does not change text/content, and does not remove cues', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'keep me', content: 'keep <i>me</i>' })],
    });
    const result = fixCommonIssues(ctx, doc);
    const cue = result.getDocument()!.getCuesList()[0];
    expect(cue.getText()).toBe('keep me');
    expect(cue.getContent()).toBe('keep <i>me</i>');
  });

  it('composes with ValidateSubtitle: fixing a document with error-level issues makes it valid', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 5000, endMs: 4000, text: 'a' }), // negative duration
        makeCue({ index: 2, startMs: 1000, endMs: 2000, text: 'b' }),
      ],
    });
    expect(validateSubtitle(ctx, doc).getValid()).toBe(false);
    const fixed = fixCommonIssues(ctx, doc).getDocument()!;
    expect(validateSubtitle(ctx, fixed).getValid()).toBe(true);
  });
});
