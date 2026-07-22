import { SubtitleDocument, RawSubtitle, RawSubtitleResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildVtt, errorMessage, BoundsError } from './lib';

/**
 * Serializes a normalized SubtitleDocument to WebVTT (.vtt) text,
 * reconstructing the "WEBVTT" header banner from `document.header`, NOTE/
 * REGION/STYLE blocks from `document.notes`, and each cue's trailing
 * settings text from `cue.settings` (e.g. "position:10%,line:0,align:start")
 * — none of which a bare parse-then-generic-build round trip would
 * preserve. Cue time strings use WebVTT's "." millisecond separator.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function serializeWebVtt(ax: AxiomContext, input: SubtitleDocument): RawSubtitleResult {
  const out = new RawSubtitleResult();
  try {
    const content = buildVtt(input);
    const subtitle = new RawSubtitle();
    subtitle.setContent(content);
    subtitle.setFormat('vtt');
    out.setSubtitle(subtitle);
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'serialize failed'));
  }
  return out;
}
