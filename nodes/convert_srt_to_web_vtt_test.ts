import { RawSubtitle } from '../gen/messages_pb';
import { convertSrtToWebVtt } from './convert_srt_to_web_vtt';
import { ctx, SRT_SIMPLE } from './testkit';

describe('ConvertSrtToWebVtt', () => {
  it('converts SRT to well-formed WebVTT text with the "." millisecond separator (hand-verified)', () => {
    const input = new RawSubtitle();
    input.setContent(SRT_SIMPLE);
    const result = convertSrtToWebVtt(ctx, input);
    expect(result.getOk()).toBe(true);
    const subtitle = result.getSubtitle()!;
    expect(subtitle.getFormat()).toBe('vtt');
    const content = subtitle.getContent();
    expect(content.startsWith('WEBVTT')).toBe(true);
    // Hand-verified: 1000ms -> 00:00:01.000 ; 2500ms -> 00:00:02.500.
    expect(content).toContain('00:00:01.000 --> 00:00:02.500');
    expect(content).toContain('Hello world');
    expect(content).toContain('00:00:03.000 --> 00:00:05.250');
    expect(content).toContain('Second line');
  });

  it('rejects oversized input with a structured error, not a crash', () => {
    const input = new RawSubtitle();
    input.setContent('x'.repeat(2_000_001));
    const result = convertSrtToWebVtt(ctx, input);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });
});
