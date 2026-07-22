import { SubtitleDocument, RawSubtitle, RawSubtitleResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildSrt, errorMessage, BoundsError } from './lib';

/**
 * Serializes a normalized SubtitleDocument to SubRip (.srt) text. SRT has
 * no header/notes/styles/cue-settings concept, so only `document.cues` is
 * used (each cue's `text` field — see Cue.content's doc comment for why
 * `content` is not what gets emitted).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function serializeSrt(ax: AxiomContext, input: SubtitleDocument): RawSubtitleResult {
  const out = new RawSubtitleResult();
  try {
    const content = buildSrt(input);
    const subtitle = new RawSubtitle();
    subtitle.setContent(content);
    subtitle.setFormat('srt');
    out.setSubtitle(subtitle);
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'serialize failed'));
  }
  return out;
}
