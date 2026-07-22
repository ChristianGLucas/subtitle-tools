import { ConvertFormatRequest, RawSubtitle, RawSubtitleResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { convertContent, errorMessage, BoundsError } from './lib';

/**
 * Converts subtitle text between any two of the seven formats subsrt-ts
 * supports: srt, vtt, ass, ssa, sbv, smi, lrc. ConvertSrtToWebVtt/
 * ConvertWebVttToSrt cover the two highest-demand conversions by name; use
 * this node for every other pair (e.g. "srt" -> "ass", "vtt" -> "lrc").
 * `source.format` empty auto-detects the source format; `to_format` is
 * required and must be one of the seven listed above.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function convertFormat(ax: AxiomContext, input: ConvertFormatRequest): RawSubtitleResult {
  const out = new RawSubtitleResult();
  try {
    const source = input.getSource();
    if (!source) throw new Error('source is required');
    const toFormat = input.getToFormat();
    const content = convertContent(source.getContent(), source.getFormat(), toFormat);
    const subtitle = new RawSubtitle();
    subtitle.setContent(content);
    subtitle.setFormat(toFormat);
    out.setSubtitle(subtitle);
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'convert failed'));
  }
  return out;
}
