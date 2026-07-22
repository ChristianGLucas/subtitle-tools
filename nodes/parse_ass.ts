import { RawSubtitle, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseToDocument, detectFormat, errorMessage, BoundsError } from './lib';

/**
 * Force-parses content as SubStation Alpha (ASS or the older SSA dialect)
 * into the normalized SubtitleDocument, ignoring the input's `format` field
 * and skipping auto-detection — both dialects share the same [Script Info]/
 * [Events] grammar and are parsed identically. `document.format` is set to
 * whichever of "ass"/"ssa" the content actually looks like (defaulting to
 * "ass" when undetermined). Captures each [V4/V4+ Styles] Style line into
 * `document.styles`, each Script Info field into `document.notes`, and each
 * Dialogue line's Style/Name/Margin/Effect/Layer columns into `cue.fields`.
 * If the content does not actually look like ASS/SSA (missing
 * "[Script Info]"/"[Events]"), this returns `ok: true` with zero cues
 * rather than an error.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseAss(ax: AxiomContext, input: RawSubtitle): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const detected = detectFormat(input.getContent());
    const format = detected === 'ass' || detected === 'ssa' ? detected : 'ass';
    out.setDocument(parseToDocument(input.getContent(), format));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'parse failed'));
  }
  return out;
}
