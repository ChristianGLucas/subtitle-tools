import { ConvertFormatRequest, RawSubtitle } from '../gen/messages_pb';
import { convertFormat } from './convert_format';
import { ctx, SRT_SIMPLE, ASS_SIMPLE } from './testkit';

function convert(content: string, fromFormat: string, toFormat: string) {
  const input = new ConvertFormatRequest();
  const source = new RawSubtitle();
  source.setContent(content);
  source.setFormat(fromFormat);
  input.setSource(source);
  input.setToFormat(toFormat);
  return convertFormat(ctx, input);
}

describe('ConvertFormat', () => {
  it('converts SRT to ASS (a pair with no dedicated node)', () => {
    const result = convert(SRT_SIMPLE, 'srt', 'ass');
    expect(result.getOk()).toBe(true);
    expect(result.getSubtitle()!.getFormat()).toBe('ass');
    const content = result.getSubtitle()!.getContent();
    expect(content).toContain('[Events]');
    expect(content).toContain('Hello world');
  });

  it('converts ASS to SRT', () => {
    const result = convert(ASS_SIMPLE, 'ass', 'srt');
    expect(result.getOk()).toBe(true);
    expect(result.getSubtitle()!.getFormat()).toBe('srt');
    // Hand-verified: 1000ms -> 00:00:01,000 ; 3500ms -> 00:00:03,500.
    expect(result.getSubtitle()!.getContent()).toBe('1\r\n00:00:01,000 --> 00:00:03,500\r\nHello ASS world\r\n\r\n');
  });

  it('auto-detects the source format when from_format is empty', () => {
    const result = convert(SRT_SIMPLE, '', 'vtt');
    expect(result.getOk()).toBe(true);
    expect(result.getSubtitle()!.getFormat()).toBe('vtt');
  });

  it('fails with a structured error on an unsupported target format', () => {
    const result = convert(SRT_SIMPLE, 'srt', 'not-a-real-format');
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/unsupported target format/i);
  });

  it('fails with a structured error when source is missing', () => {
    const input = new ConvertFormatRequest();
    input.setToFormat('srt');
    const result = convertFormat(ctx, input);
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toMatch(/source is required/i);
  });
});
