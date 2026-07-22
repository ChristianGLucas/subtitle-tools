import { validateSubtitle } from './validate_subtitle';
import { ctx, makeCue, makeDocument } from './testkit';

describe('ValidateSubtitle', () => {
  it('reports zero issues and valid=true for a well-formed document', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'a' }),
        makeCue({ index: 2, startMs: 1000, endMs: 2000, text: 'b' }),
      ],
    });
    const result = validateSubtitle(ctx, doc);
    expect(result.getOk()).toBe(true);
    expect(result.getValid()).toBe(true);
    expect(result.getIssuesList()).toHaveLength(0);
  });

  it('flags zero/negative duration as an "error", tagged with the cue index', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 5, startMs: 1000, endMs: 1000, text: 'zero' }), // zero_duration
        makeCue({ index: 6, startMs: 5000, endMs: 4000, text: 'negative' }), // negative_duration
      ],
    });
    const result = validateSubtitle(ctx, doc);
    expect(result.getValid()).toBe(false);
    const issues = result.getIssuesList();
    expect(issues.some((i) => i.getCueIndex() === 5 && i.getKind() === 'zero_duration' && i.getSeverity() === 'error')).toBe(true);
    expect(issues.some((i) => i.getCueIndex() === 6 && i.getKind() === 'negative_duration' && i.getSeverity() === 'error')).toBe(true);
  });

  it('flags overlap and out-of-order as "warning" — does not make the document invalid by itself', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 2000, endMs: 3000, text: 'a' }),
        makeCue({ index: 2, startMs: 1000, endMs: 4000, text: 'b' }), // starts before cue 1 (out_of_order) AND overlaps it
      ],
    });
    const result = validateSubtitle(ctx, doc);
    expect(result.getValid()).toBe(true); // only warnings, no errors
    const kinds = result.getIssuesList().map((i) => i.getKind());
    expect(kinds).toContain('out_of_order');
    expect(kinds).toContain('overlap');
    expect(result.getIssuesList().every((i) => i.getSeverity() === 'warning')).toBe(true);
  });

  it('flags empty text as a warning', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 0, endMs: 1000, text: '   ' })],
    });
    const result = validateSubtitle(ctx, doc);
    expect(result.getIssuesList().some((i) => i.getKind() === 'empty_text')).toBe(true);
  });

  it('REGRESSION (found by adversarial review): flags a negative timestamp as an "error", making the document invalid', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: -900, endMs: -500, text: 'a' })],
    });
    const result = validateSubtitle(ctx, doc);
    expect(result.getValid()).toBe(false);
    const issues = result.getIssuesList();
    expect(issues.some((i) => i.getCueIndex() === 1 && i.getKind() === 'negative_timestamp' && i.getSeverity() === 'error')).toBe(true);
  });
});
