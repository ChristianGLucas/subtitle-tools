import { RawSubtitle, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseToDocument, errorMessage, BoundsError } from './lib';

/**
 * Parses a subtitle file into the normalized SubtitleDocument (cues with
 * start/end times in milliseconds, plus header/notes/styles metadata).
 * Auto-detects the format (SRT, WebVTT, ASS, SSA, SBV, SMI, or LRC) unless
 * `format` is set on the input, in which case that format is forced. Fails
 * with a structured error if the format cannot be determined — use
 * DetectFormat first to check, or a format-specific Parse* node to force-
 * parse content as a known format regardless of what it looks like.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseSubtitle(ax: AxiomContext, input: RawSubtitle): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    out.setDocument(parseToDocument(input.getContent(), input.getFormat()));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'parse failed'));
  }
  return out;
}
