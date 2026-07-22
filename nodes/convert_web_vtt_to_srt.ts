import { RawSubtitle, RawSubtitleResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { convertContent, errorMessage, BoundsError } from './lib';

/**
 * Converts WebVTT (.vtt) text directly to SubRip (.srt) text — the reverse
 * of ConvertSrtToWebVtt, for tooling that only accepts SRT. Any WebVTT
 * header banner, NOTE/REGION/STYLE blocks, or per-cue settings in the
 * source are dropped (SRT has no equivalent concept for any of them). The
 * input's `format` field is ignored; content is always parsed as WebVTT.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function convertWebVttToSrt(ax: AxiomContext, input: RawSubtitle): RawSubtitleResult {
  const out = new RawSubtitleResult();
  try {
    const content = convertContent(input.getContent(), 'vtt', 'srt');
    const subtitle = new RawSubtitle();
    subtitle.setContent(content);
    subtitle.setFormat('srt');
    out.setSubtitle(subtitle);
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'convert failed'));
  }
  return out;
}
