import { Cue, MergeCuesRequest, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { withCues, checkCueCount, errorMessage, BoundsError } from './lib';

/**
 * Merges consecutive cues into one wherever the gap between them is small
 * enough — cleanup for over-segmented captions (e.g. auto-generated
 * transcripts that split one spoken sentence across many short cues).
 * Cues are processed in document order: cue[i+1] merges into the running
 * cue when (cue[i+1].start_ms - cue[i].end_ms) <= max_gap_ms. A merged
 * cue's start/end span both original cues; its text/content join the
 * originals with a newline. `max_gap_ms: 0` merges only cues that are
 * strictly touching or overlapping. Result cues are renumbered 1..N.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function mergeCues(ax: AxiomContext, input: MergeCuesRequest): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const doc = input.getDocument();
    if (!doc) throw new Error('document is required');
    const maxGapMs = input.getMaxGapMs();
    const cues = doc.getCuesList();
    checkCueCount(cues.length);
    const merged: Cue[] = [];
    for (const cue of cues) {
      const prev = merged[merged.length - 1];
      if (prev && cue.getStartMs() - prev.getEndMs() <= maxGapMs) {
        if (cue.getEndMs() > prev.getEndMs()) prev.setEndMs(cue.getEndMs());
        if (cue.getText()) prev.setText(prev.getText() ? prev.getText() + '\n' + cue.getText() : cue.getText());
        if (cue.getContent()) prev.setContent(prev.getContent() ? prev.getContent() + '\n' + cue.getContent() : cue.getContent());
        continue;
      }
      merged.push(cue.cloneMessage() as Cue);
    }
    merged.forEach((c, i) => c.setIndex(i + 1));
    out.setDocument(withCues(doc, merged));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'merge failed'));
  }
  return out;
}
