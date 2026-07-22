import { ScaleTimingRequest } from '../gen/messages_pb';
import { scaleTiming } from './scale_timing';
import { ctx, makeCue, makeDocument } from './testkit';

describe('ScaleTiming', () => {
  it('scales by a direct factor (hand-computed: 1000*1.5=1500, 4000*1.5=6000)', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 1000, endMs: 4000, text: 'a' })],
    });
    const req = new ScaleTimingRequest();
    req.setDocument(doc);
    req.setFactor(1.5);
    const result = scaleTiming(ctx, req);
    expect(result.getOk()).toBe(true);
    const cue = result.getDocument()!.getCuesList()[0];
    expect(cue.getStartMs()).toBe(1500);
    expect(cue.getEndMs()).toBe(6000);
  });

  it('derives factor from from_fps/to_fps (hand-computed: factor=25/23.976≈1.0427; 24000ms*factor≈25025ms rounded)', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 24_000, endMs: 24_000, text: 'a' })],
    });
    const req = new ScaleTimingRequest();
    req.setDocument(doc);
    req.setFromFps(25);
    req.setToFps(23.976);
    const result = scaleTiming(ctx, req);
    expect(result.getOk()).toBe(true);
    const factor = 25 / 23.976;
    const expectedMs = Math.round(24_000 * factor);
    expect(result.getDocument()!.getCuesList()[0].getStartMs()).toBe(expectedMs);
  });

  it('fails with a structured error when neither factor nor fps pair is supplied', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 0, endMs: 1000, text: 'a' })],
    });
    const req = new ScaleTimingRequest();
    req.setDocument(doc);
    const result = scaleTiming(ctx, req);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/must supply either factor/i);
  });

  it('fails with a structured error when document is missing', () => {
    const req = new ScaleTimingRequest();
    req.setFactor(2);
    const result = scaleTiming(ctx, req);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/document is required/i);
  });

  it('REGRESSION (same class as ShiftTiming, found by adversarial review): a negative factor producing negative timestamps fails with a structured error rather than ok:true with corrupted output', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [makeCue({ index: 1, startMs: 1000, endMs: 2000, text: 'a' })],
    });
    const req = new ScaleTimingRequest();
    req.setDocument(doc);
    req.setFactor(-1);
    const result = scaleTiming(ctx, req);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/negative timestamp/i);
  });
});
