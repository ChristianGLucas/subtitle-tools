import { SubtitleDocument, RawSubtitle, RawSubtitleResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildAss, errorMessage, BoundsError } from './lib';

/**
 * Serializes a normalized SubtitleDocument to SubStation Alpha text — ASS
 * ("[V4+ Styles]") when `document.format === "ass"`, otherwise the older
 * SSA dialect ("[V4 Styles]"). Reconstructs [Script Info] from
 * `document.notes` and the style block from `document.styles`, falling
 * back to a single standard default style when the document has none of
 * its own (e.g. one converted from SRT/VTT, which never had ASS styles to
 * begin with) — so the output is always a valid, loadable ASS/SSA file.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function serializeAss(ax: AxiomContext, input: SubtitleDocument): RawSubtitleResult {
  const out = new RawSubtitleResult();
  try {
    const isAss = input.getFormat() === 'ass';
    const content = buildAss(input, isAss);
    const subtitle = new RawSubtitle();
    subtitle.setContent(content);
    subtitle.setFormat(isAss ? 'ass' : 'ssa');
    out.setSubtitle(subtitle);
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'serialize failed'));
  }
  return out;
}
