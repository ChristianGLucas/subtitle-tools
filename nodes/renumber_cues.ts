import { Cue, SubtitleDocument, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { withCues, errorMessage, BoundsError } from './lib';

/**
 * Resets every cue's `index` to a sequential 1..N in the document's
 * EXISTING order — does not reorder cues (see FixCommonIssues to also sort
 * by start time first). Useful after ExtractRange/MergeCues from another
 * tool, or to clean up a document with a gapped/non-sequential index.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function renumberCues(ax: AxiomContext, input: SubtitleDocument): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const cues = input.getCuesList();
    const renumbered = cues.map((c, i) => {
      const clone = c.cloneMessage() as Cue;
      clone.setIndex(i + 1);
      return clone;
    });
    out.setDocument(withCues(input, renumbered));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'renumber failed'));
  }
  return out;
}
