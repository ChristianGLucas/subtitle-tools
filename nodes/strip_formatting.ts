import { Cue, SubtitleDocument, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { withCues, checkCueCount, errorMessage, BoundsError } from './lib';

/**
 * Strips formatting from every cue by overwriting `content` (raw, markup
 * intact) with `text` (already cleaned by the parser — `<i>`/`<b>` tags,
 * `{\an8}`/`{\pos(...)}` ASS override codes, and `>> SPEAKER:` prefixes all
 * removed). After this node, the Serialize/Convert nodes' output is
 * unaffected (they already emit from `text`) — this node exists for a
 * caller that
 * wants to inspect or otherwise consume `content` and needs it clean too.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function stripFormatting(ax: AxiomContext, input: SubtitleDocument): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const cues = input.getCuesList();
    checkCueCount(cues.length);
    const stripped = cues.map((c) => {
      const clone = c.cloneMessage() as Cue;
      clone.setContent(clone.getText());
      return clone;
    });
    out.setDocument(withCues(input, stripped));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'strip failed'));
  }
  return out;
}
