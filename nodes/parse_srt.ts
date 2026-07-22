import { RawSubtitle, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseToDocument, errorMessage, BoundsError } from './lib';

/**
 * Force-parses content as SubRip (.srt) into the normalized
 * SubtitleDocument, ignoring the input's `format` field and skipping
 * auto-detection. If the content does not actually look like SRT, this
 * returns `ok: true` with zero cues (SRT's cue grammar simply does not
 * match anything) rather than an error — use DetectFormat first if you need
 * to confirm the content really is SRT.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseSrt(ax: AxiomContext, input: RawSubtitle): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    out.setDocument(parseToDocument(input.getContent(), 'srt'));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'parse failed'));
  }
  return out;
}
