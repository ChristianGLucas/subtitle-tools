import { Cue, SubtitleDocument, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { withCues, errorMessage, BoundsError } from './lib';

const MIN_DURATION_MS = 1;

/**
 * Automatically corrects the "error"-severity issues ValidateSubtitle
 * reports: stable-sorts cues by start_ms ascending (so out-of-order/
 * overlap warnings are minimized as a side effect, though overlap between
 * genuinely-overlapping cues is not itself altered), then clamps any cue
 * with end_ms <= start_ms to a minimum 1ms duration (end_ms = start_ms +
 * 1). Cues are renumbered 1..N in their new (sorted) order. Does not
 * change cue text/content, and does not remove cues.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function fixCommonIssues(ax: AxiomContext, input: SubtitleDocument): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const cues = input.getCuesList();
    const sorted = cues
      .map((c) => c.cloneMessage() as Cue)
      .sort((a, b) => a.getStartMs() - b.getStartMs());
    for (const c of sorted) {
      if (c.getEndMs() <= c.getStartMs()) {
        c.setEndMs(c.getStartMs() + MIN_DURATION_MS);
      }
    }
    sorted.forEach((c, i) => c.setIndex(i + 1));
    out.setDocument(withCues(input, sorted));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'fix failed'));
  }
  return out;
}
