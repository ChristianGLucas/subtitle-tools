import { ShiftTimingRequest } from '../gen/messages_pb';
import { shiftTiming } from './shift_timing';
import { ctx, makeCue, makeDocument } from './testkit';

describe('ShiftTiming', () => {
  it('adds a positive offset to every cue start/end, unchanged duration (hand-computed)', () => {
    const doc = makeDocument({
      format: 'srt',
      cues: [
        makeCue({ index: 1, startMs: 1000, endMs: 2500, text: 'a' }),
        makeCue({ index: 2, startMs: 5000, endMs: 6000, text: 'b' }),
      ],
    });
    const req = new ShiftTimingRequest();
    req.setDocument(doc);
    req.setOffsetMs(500);
    const result = shiftTiming(ctx, req);
    expect(result.getOk()).toBe(true);
    const cues = result.getDocument()!.getCuesList();
    expect(cues[0].getStartMs()).toBe(1500);
    expect(cues[0].getEndMs()).toBe(3000);
    expect(cues[1].getStartMs()).toBe(5500);
    expect(cues[1].getEndMs()).toBe(6500);
  });

  it('subtracts with a negative offset, hand-computed, and preserves text/settings', () => {
    const doc = makeDocument({
      format: 'vtt',
      cues: [makeCue({ index: 1, startMs: 5000, endMs: 6000, text: 'hi', settings: 'line:1' })],
    });
    const req = new ShiftTimingRequest();
    req.setDocument(doc);
    req.setOffsetMs(-2000);
    const result = shiftTiming(ctx, req);
    expect(result.getOk()).toBe(true);
    const cue = result.getDocument()!.getCuesList()[0];
    expect(cue.getStartMs()).toBe(3000);
    expect(cue.getEndMs()).toBe(4000);
    expect(cue.getText()).toBe('hi');
    expect(cue.getSettings()).toBe('line:1');
  });

  it('fails with a structured error when document is missing', () => {
    const req = new ShiftTimingRequest();
    req.setOffsetMs(100);
    const result = shiftTiming(ctx, req);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/document is required/i);
  });
});
