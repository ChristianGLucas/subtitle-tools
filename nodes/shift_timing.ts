import { ShiftTimingRequest, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { resyncCues, withCues, errorMessage, BoundsError } from './lib';

/**
 * Shifts every cue's start and end time by a constant offset — the #1 real
 * subtitle operation (resyncing a file that plays too early/late against
 * its video). `offset_ms` may be negative (shifts earlier); cue durations
 * are unchanged. Delegates the actual arithmetic to subsrt.resync().
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function shiftTiming(ax: AxiomContext, input: ShiftTimingRequest): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const doc = input.getDocument();
    if (!doc) throw new Error('document is required');
    const cues = resyncCues(doc, input.getOffsetMs());
    out.setDocument(withCues(doc, cues));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'shift failed'));
  }
  return out;
}
