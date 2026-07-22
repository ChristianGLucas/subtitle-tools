import { ExtractRangeRequest } from '../gen/messages_pb';
import { extractRange } from './extract_range';
import { ctx, makeCue, makeDocument } from './testkit';

describe('ExtractRange', () => {
  const doc = makeDocument({
    format: 'srt',
    cues: [
      makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'a' }), // before window
      makeCue({ index: 2, startMs: 1500, endMs: 2500, text: 'b' }), // overlaps window start
      makeCue({ index: 3, startMs: 3000, endMs: 4000, text: 'c' }), // fully inside
      makeCue({ index: 4, startMs: 4500, endMs: 6000, text: 'd' }), // overlaps window end
      makeCue({ index: 5, startMs: 7000, endMs: 8000, text: 'e' }), // after window
    ],
  });

  it('keeps only cues overlapping [start_ms, end_ms), with original timing unchanged, renumbered 1..N', () => {
    const req = new ExtractRangeRequest();
    req.setDocument(doc);
    req.setStartMs(2000);
    req.setEndMs(5000);
    const result = extractRange(ctx, req);
    expect(result.getOk()).toBe(true);
    const cues = result.getDocument()!.getCuesList();
    expect(cues.map((c) => c.getText())).toEqual(['b', 'c', 'd']);
    expect(cues.map((c) => c.getIndex())).toEqual([1, 2, 3]);
    // Original timing (unclipped) preserved:
    expect(cues[0].getStartMs()).toBe(1500);
    expect(cues[0].getEndMs()).toBe(2500);
  });

  it('returns zero cues for a window with no overlap', () => {
    const req = new ExtractRangeRequest();
    req.setDocument(doc);
    req.setStartMs(100_000);
    req.setEndMs(200_000);
    const result = extractRange(ctx, req);
    expect(result.getOk()).toBe(true);
    expect(result.getDocument()!.getCuesList()).toHaveLength(0);
  });

  it('fails with a structured error when end_ms <= start_ms', () => {
    const req = new ExtractRangeRequest();
    req.setDocument(doc);
    req.setStartMs(5000);
    req.setEndMs(1000);
    const result = extractRange(ctx, req);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/end_ms must be greater than start_ms/i);
  });
});
