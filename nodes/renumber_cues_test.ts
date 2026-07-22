import { renumberCues } from './renumber_cues';
import { ctx, makeCue, makeDocument } from './testkit';

describe('RenumberCues', () => {
  it('resets index to sequential 1..N without reordering', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 7, startMs: 5000, endMs: 6000, text: 'later' }),
        makeCue({ index: 3, startMs: 0, endMs: 1000, text: 'earlier' }), // out of time order on purpose
        makeCue({ index: 99, startMs: 2000, endMs: 3000, text: 'middle' }),
      ],
    });
    const result = renumberCues(ctx, doc);
    expect(result.getOk()).toBe(true);
    const cues = result.getDocument()!.getCuesList();
    expect(cues.map((c) => c.getIndex())).toEqual([1, 2, 3]);
    // Order is UNCHANGED (not sorted by time) — text sequence proves it.
    expect(cues.map((c) => c.getText())).toEqual(['later', 'earlier', 'middle']);
  });

  it('handles an empty document', () => {
    const result = renumberCues(ctx, makeDocument({ format: 'srt', cues: [] }));
    expect(result.getOk()).toBe(true);
    expect(result.getDocument()!.getCuesList()).toHaveLength(0);
  });
});
