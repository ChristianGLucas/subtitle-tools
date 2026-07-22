import { ScaleTimingRequest, SubtitleDocumentResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { resyncCues, withCues, errorMessage, BoundsError } from './lib';

/**
 * Re-times every cue by a multiplicative factor — the framerate-drift
 * correction node (e.g. 23.976 <-> 25 fps). Supply EITHER `factor` directly
 * (new_ms = round(old_ms * factor)), OR both `from_fps`/`to_fps`, in which
 * case factor is derived as from_fps / to_fps: the ratio that converts a
 * timestamp authored assuming from_fps into one correct for playback at
 * to_fps (e.g. from_fps=25, to_fps=23.976 stretches every timestamp,
 * correcting subtitles authored for PAL video played back at film rate).
 * Fails if neither `factor` nor both fps fields are supplied. Delegates the
 * actual arithmetic to subsrt.resync().
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function scaleTiming(ax: AxiomContext, input: ScaleTimingRequest): SubtitleDocumentResult {
  const out = new SubtitleDocumentResult();
  try {
    const doc = input.getDocument();
    if (!doc) throw new Error('document is required');
    let factor = input.getFactor();
    if (!factor) {
      const fromFps = input.getFromFps();
      const toFps = input.getToFps();
      if (fromFps > 0 && toFps > 0) {
        factor = fromFps / toFps;
      } else {
        throw new Error('must supply either factor, or both from_fps and to_fps');
      }
    }
    const cues = resyncCues(doc, 0, factor);
    out.setDocument(withCues(doc, cues));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'scale failed'));
  }
  return out;
}
