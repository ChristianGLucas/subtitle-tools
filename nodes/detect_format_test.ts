import { DetectFormatRequest } from '../gen/messages_pb';
import { detectFormat } from './detect_format';
import { ctx, SRT_SIMPLE, VTT_WITH_HEADER_NOTES_SETTINGS, ASS_SIMPLE } from './testkit';

function detect(content: string) {
  const input = new DetectFormatRequest();
  input.setContent(content);
  return detectFormat(ctx, input);
}

describe('DetectFormat', () => {
  it('detects SRT', () => {
    const result = detect(SRT_SIMPLE);
    expect(result.getOk()).toBe(true);
    expect(result.getDetected()).toBe(true);
    expect(result.getFormat()).toBe('srt');
  });

  it('detects WebVTT', () => {
    const result = detect(VTT_WITH_HEADER_NOTES_SETTINGS);
    expect(result.getOk()).toBe(true);
    expect(result.getDetected()).toBe(true);
    expect(result.getFormat()).toBe('vtt');
  });

  it('detects ASS', () => {
    const result = detect(ASS_SIMPLE);
    expect(result.getOk()).toBe(true);
    expect(result.getDetected()).toBe(true);
    expect(result.getFormat()).toBe('ass');
  });

  it('returns detected=false, format="" for unrecognized content, not an error', () => {
    const result = detect('just some plain prose, not a subtitle file at all');
    expect(result.getOk()).toBe(true);
    expect(result.getDetected()).toBe(false);
    expect(result.getFormat()).toBe('');
  });

  it('detects WebVTT with an inline header on the WEBVTT line (a confirmed subsrt-ts detect() gap this package corrects — see lib.ts:detectFormat)', () => {
    const result = detect('WEBVTT Kind: captions; Language: en\r\n\r\n1\r\n00:00:01.000 --> 00:00:02.000\r\nhi\r\n\r\n');
    expect(result.getOk()).toBe(true);
    expect(result.getFormat()).toBe('vtt');
  });

  it('rejects oversized input with a structured error, not a crash', () => {
    const result = detect('x'.repeat(2_000_001));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/bounds/i);
  });
});
