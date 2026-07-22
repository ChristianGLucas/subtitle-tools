import { DetectFormatRequest, DetectFormatResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkContentLen, detectFormat as detectFormatLib, errorMessage, BoundsError } from './lib';

/**
 * Detects a subtitle document's format (SRT, WebVTT, ASS, or SSA — plus SBV/
 * SMI/LRC) from its content alone, without parsing it into cues. Returns
 * `detected: false` and `format: ""` when the content does not match any
 * known format, rather than an error — that is a normal, valid outcome for
 * arbitrary caller-supplied text, not a failure.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function detectFormat(ax: AxiomContext, input: DetectFormatRequest): DetectFormatResult {
  const out = new DetectFormatResult();
  try {
    checkContentLen(input.getContent());
    const format = detectFormatLib(input.getContent());
    out.setOk(true);
    out.setFormat(format);
    out.setDetected(format !== '');
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'detect failed'));
  }
  return out;
}
