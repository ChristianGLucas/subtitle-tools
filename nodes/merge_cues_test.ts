import { MergeCuesRequest } from '../gen/messages_pb';
import { mergeCues } from './merge_cues';
import { ctx, makeCue, makeDocument } from './testkit';

describe('MergeCues', () => {
  it('merges cues whose gap is within max_gap_ms, joining text with a newline and spanning start/end', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'First' }),
        makeCue({ index: 2, startMs: 1200, endMs: 2000, text: 'Second' }), // gap=200
        makeCue({ index: 3, startMs: 5000, endMs: 6000, text: 'Third' }), // gap=3000, not merged
      ],
    });
    const req = new MergeCuesRequest();
    req.setDocument(doc);
    req.setMaxGapMs(300);
    const result = mergeCues(ctx, req);
    expect(result.getOk()).toBe(true);
    const cues = result.getDocument()!.getCuesList();
    expect(cues).toHaveLength(2);
    expect(cues[0].getStartMs()).toBe(0);
    expect(cues[0].getEndMs()).toBe(2000); // spans both merged cues
    expect(cues[0].getText()).toBe('First\nSecond');
    expect(cues[0].getIndex()).toBe(1);
    expect(cues[1].getText()).toBe('Third');
    expect(cues[1].getIndex()).toBe(2);
  });

  it('max_gap_ms=0 merges only strictly touching/overlapping cues', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'a' }),
        makeCue({ index: 2, startMs: 1000, endMs: 2000, text: 'b' }), // gap=0, exactly touching
        makeCue({ index: 3, startMs: 2001, endMs: 3000, text: 'c' }), // gap=1, not merged
      ],
    });
    const req = new MergeCuesRequest();
    req.setDocument(doc);
    req.setMaxGapMs(0);
    const result = mergeCues(ctx, req);
    const cues = result.getDocument()!.getCuesList();
    expect(cues).toHaveLength(2);
    expect(cues[0].getText()).toBe('a\nb');
    expect(cues[1].getText()).toBe('c');
  });

  it('leaves a document unchanged (aside from renumbering) when no gaps qualify', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'a' }),
        makeCue({ index: 2, startMs: 5000, endMs: 6000, text: 'b' }),
      ],
    });
    const req = new MergeCuesRequest();
    req.setDocument(doc);
    req.setMaxGapMs(0);
    const result = mergeCues(ctx, req);
    expect(result.getDocument()!.getCuesList()).toHaveLength(2);
  });
});
