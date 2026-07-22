import { RawSubtitle, RawSubtitleResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { convertContent, errorMessage, BoundsError } from './lib';

/**
 * Converts SubRip (.srt) text directly to WebVTT (.vtt) text — the #1
 * cross-format conversion (browsers/HTML5 <track> require WebVTT, most
 * distributed subtitles ship as SRT). The input's `format` field is
 * ignored; content is always parsed as SRT.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function convertSrtToWebVtt(ax: AxiomContext, input: RawSubtitle): RawSubtitleResult {
  const out = new RawSubtitleResult();
  try {
    const content = convertContent(input.getContent(), 'srt', 'vtt');
    const subtitle = new RawSubtitle();
    subtitle.setContent(content);
    subtitle.setFormat('vtt');
    out.setSubtitle(subtitle);
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'convert failed'));
  }
  return out;
}
