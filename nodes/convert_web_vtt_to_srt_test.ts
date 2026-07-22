import { RawSubtitle } from '../gen/messages_pb';
import { convertWebVttToSrt } from './convert_web_vtt_to_srt';
import { ctx, VTT_WITH_HEADER_NOTES_SETTINGS } from './testkit';

describe('ConvertWebVttToSrt', () => {
  it('converts WebVTT to well-formed SRT text with the "," millisecond separator (hand-verified), dropping header/notes/settings which SRT has no concept of', () => {
    const input = new RawSubtitle();
    input.setContent(VTT_WITH_HEADER_NOTES_SETTINGS);
    const result = convertWebVttToSrt(ctx, input);
    expect(result.getOk()).toBe(true);
    const subtitle = result.getSubtitle()!;
    expect(subtitle.getFormat()).toBe('srt');
    const content = subtitle.getContent();
    expect(content).not.toContain('WEBVTT');
    expect(content).not.toContain('NOTE');
    // Hand-verified: 1000ms -> 00:00:01,000 ; 4000ms -> 00:00:04,000.
    expect(content).toBe('1\r\n00:00:01,000 --> 00:00:04,000\r\nHello world\r\n\r\n');
  });

  it('rejects oversized input with a structured error, not a crash', () => {
    const input = new RawSubtitle();
    input.setContent('x'.repeat(2_000_001));
    const result = convertWebVttToSrt(ctx, input);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });
});
