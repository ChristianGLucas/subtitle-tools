import { RawSubtitle, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseToDocument, errorMessage, BoundsError } from './lib';

/**
 * Force-parses content as WebVTT (.vtt) into the normalized
 * SubtitleDocument, ignoring the input's `format` field and skipping
 * auto-detection. Captures the "WEBVTT" header banner into `document.header`,
 * NOTE/REGION/STYLE blocks into `document.notes`, and each cue's trailing
 * settings text (e.g. "position:10%,line:0,align:start") into
 * `cue.settings` — all three are normalized away by generic parsing but
 * preserved here. If the content does not actually look like WebVTT
 * (missing the leading "WEBVTT" line), this returns `ok: true` with zero
 * cues rather than an error.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseWebVtt(ax: AxiomContext, input: RawSubtitle): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    out.setDocument(parseToDocument(input.getContent(), 'vtt'));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'parse failed'));
  }
  return out;
}
