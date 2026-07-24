import { SubtitleDocument, PlainTextResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { errorMessage, BoundsError } from './lib';

/**
 * Extracts just the plain text of every cue — no timing, no markup, no
 * per-format structure — for feeding a transcript to an LLM or a
 * readability/tokenizer node. Cues are joined in document order, each
 * separated by a blank line; cues with empty text contribute nothing but a
 * separator.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractText(ax: AxiomContext, input: SubtitleDocument): PlainTextResult {
  const out = new PlainTextResult();
  try {
    const cues = input.getCuesList();
    out.setText(cues.map((c) => c.getText()).join('\n\n'));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'extract failed'));
  }
  return out;
}
