import { Cue, ExtractRangeRequest, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { withCues, errorMessage, BoundsError } from './lib';

/**
 * Keeps only the cues that overlap a caller-supplied [start_ms, end_ms)
 * time window — any cue with end_ms > start_ms AND start_ms < end_ms is
 * kept, in full, with its ORIGINAL timing unchanged (cues are not clipped
 * to the window boundary). Kept cues are renumbered 1..N in their original
 * relative order. Requires end_ms > start_ms.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractRange(ax: AxiomContext, input: ExtractRangeRequest): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const doc = input.getDocument();
    if (!doc) throw new Error('document is required');
    const startMs = input.getStartMs();
    const endMs = input.getEndMs();
    if (endMs <= startMs) throw new Error('end_ms must be greater than start_ms');
    const kept = doc
      .getCuesList()
      .filter((c) => c.getEndMs() > startMs && c.getStartMs() < endMs)
      .map((c, i) => {
        const clone = c.cloneMessage() as Cue;
        clone.setIndex(i + 1);
        return clone;
      });
    out.setDocument(withCues(doc, kept));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'extract failed'));
  }
  return out;
}
