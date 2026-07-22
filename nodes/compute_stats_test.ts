import { computeStats } from './compute_stats';
import { ctx, makeCue, makeDocument } from './testkit';

describe('ComputeStats', () => {
  it('computes cue count, total duration, span, and per-cue/average reading speed (hand-computed)', () => {
    // Cue 1: "Hello" (5 chars), 1000ms duration -> 5 / 1.0 = 5 cps.
    // Cue 2: "Hi there" (8 chars), 2000ms duration -> 8 / 2.0 = 4 cps.
    // total_duration_ms = 1000 + 2000 = 3000. first_start=0, last_end=5000 (gap 3000-4000).
    // avg_cps = (5 + 4) / 2 = 4.5.
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'Hello' }),
        makeCue({ index: 2, startMs: 3000, endMs: 5000, text: 'Hi there' }),
      ],
    });
    const result = computeStats(ctx, doc);
    expect(result.getOk()).toBe(true);
    expect(result.getCueCount()).toBe(2);
    expect(result.getTotalDurationMs()).toBe(3000);
    expect(result.getFirstStartMs()).toBe(0);
    expect(result.getLastEndMs()).toBe(5000);
    expect(result.getAvgCharsPerSecond()).toBeCloseTo(4.5, 5);
    const stats = result.getCueStatsList();
    expect(stats[0].getCharCount()).toBe(5);
    expect(stats[0].getCharsPerSecond()).toBeCloseTo(5, 5);
    expect(stats[1].getCharCount()).toBe(8);
    expect(stats[1].getCharsPerSecond()).toBeCloseTo(4, 5);
  });

  it('excludes non-positive-duration cues from the average (not counted as 0)', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 0, endMs: 0, text: 'zero duration' }), // cps=0, excluded from avg
        makeCue({ index: 2, startMs: 1000, endMs: 2000, text: 'ab' }), // 2 chars / 1s = 2 cps
      ],
    });
    const result = computeStats(ctx, doc);
    expect(result.getCueStatsList()[0].getCharsPerSecond()).toBe(0);
    // avg over ONLY the positive-duration cue: 2, not (0+2)/2=1.
    expect(result.getAvgCharsPerSecond()).toBeCloseTo(2, 5);
  });

  it('returns all-zero stats with ok=true for an empty document', () => {
    const result = computeStats(ctx, makeDocument({ format: 'srt', cues: [] }));
    expect(result.getOk()).toBe(true);
    expect(result.getCueCount()).toBe(0);
    expect(result.getTotalDurationMs()).toBe(0);
    expect(result.getAvgCharsPerSecond()).toBe(0);
  });
});
