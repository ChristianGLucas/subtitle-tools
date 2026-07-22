import { SubtitleDocument, ValidationIssue, ValidationResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkCueCount, errorMessage, BoundsError } from './lib';

function issue(cueIndex: number, kind: string, severity: string, message: string): ValidationIssue {
  const v = new ValidationIssue();
  v.setCueIndex(cueIndex);
  v.setKind(kind);
  v.setSeverity(severity);
  v.setMessage(message);
  return v;
}

/**
 * Checks a SubtitleDocument's cues (in their EXISTING order — this does not
 * sort first) for: negative or zero duration (end_ms <= start_ms, "error"),
 * cues out of start-time order relative to the previous cue ("warning" —
 * not itself wrong, but usually a sign of a bad export), consecutive cues
 * whose times overlap ("warning"), and empty cue text ("warning"). Reports
 * every issue found, each tagged with the offending cue's `index`.
 * `valid` is true iff there are zero "error"-severity issues (warnings
 * alone do not make a document invalid). See FixCommonIssues to
 * automatically correct the "error"-severity issues.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function validateSubtitle(ax: AxiomContext, input: SubtitleDocument): ValidationResult {
  const out = new ValidationResult();
  try {
    const cues = input.getCuesList();
    checkCueCount(cues.length);
    const issues: ValidationIssue[] = [];
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i];
      const start = cue.getStartMs();
      const end = cue.getEndMs();
      if (end <= start) {
        const kind = end === start ? 'zero_duration' : 'negative_duration';
        issues.push(issue(cue.getIndex(), kind, 'error', `cue ${cue.getIndex()}: end_ms (${end}) <= start_ms (${start})`));
      }
      if (!cue.getText().trim()) {
        issues.push(issue(cue.getIndex(), 'empty_text', 'warning', `cue ${cue.getIndex()}: text is empty`));
      }
      if (i > 0) {
        const prev = cues[i - 1];
        if (start < prev.getStartMs()) {
          issues.push(
            issue(cue.getIndex(), 'out_of_order', 'warning', `cue ${cue.getIndex()}: start_ms (${start}) is before previous cue's start_ms (${prev.getStartMs()})`),
          );
        }
        if (start < prev.getEndMs()) {
          issues.push(
            issue(cue.getIndex(), 'overlap', 'warning', `cue ${cue.getIndex()}: starts (${start}) before previous cue ends (${prev.getEndMs()})`),
          );
        }
      }
    }
    out.setIssuesList(issues);
    out.setValid(!issues.some((i) => i.getSeverity() === 'error'));
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'validate failed'));
  }
  return out;
}
