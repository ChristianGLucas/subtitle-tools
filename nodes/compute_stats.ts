import { CueReadingStat, SubtitleDocument, StatsResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { errorMessage, BoundsError } from './lib';

/**
 * Computes cue count, total on-screen duration, document span, and
 * reading-speed (characters per second) statistics — the caption-quality
 * node. `total_duration_ms` sums each cue's own (end_ms - start_ms); it is
 * NOT the document span (use first_start_ms/last_end_ms for that — they
 * differ whenever there are gaps between cues). `chars_per_second` per cue
 * is char_count / (duration_ms / 1000), 0 for a cue with duration_ms <= 0;
 * `avg_chars_per_second` averages only over cues with a positive duration.
 * An empty document returns all-zero stats with `ok: true`.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function computeStats(ax: AxiomContext, input: SubtitleDocument): StatsResult {
  const out = new StatsResult();
  try {
    const cues = input.getCuesList();
    out.setCueCount(cues.length);
    if (cues.length === 0) {
      out.setOk(true);
      return out;
    }
    let totalDuration = 0;
    let firstStart = cues[0].getStartMs();
    let lastEnd = cues[0].getEndMs();
    let cpsSum = 0;
    let cpsCount = 0;
    const perCue: CueReadingStat[] = [];
    for (const cue of cues) {
      const start = cue.getStartMs();
      const end = cue.getEndMs();
      const duration = end - start;
      totalDuration += duration;
      if (start < firstStart) firstStart = start;
      if (end > lastEnd) lastEnd = end;
      const charCount = cue.getText().length;
      const cps = duration > 0 ? charCount / (duration / 1000) : 0;
      if (duration > 0) {
        cpsSum += cps;
        cpsCount += 1;
      }
      const stat = new CueReadingStat();
      stat.setIndex(cue.getIndex());
      stat.setCharCount(charCount);
      stat.setDurationMs(duration);
      stat.setCharsPerSecond(cps);
      perCue.push(stat);
    }
    out.setTotalDurationMs(totalDuration);
    out.setFirstStartMs(firstStart);
    out.setLastEndMs(lastEnd);
    out.setAvgCharsPerSecond(cpsCount > 0 ? cpsSum / cpsCount : 0);
    out.setCueStatsList(perCue);
    out.setOk(true);
  } catch (e) {
    out.setOk(false);
    out.setError(errorMessage(e, e instanceof BoundsError ? 'bounds' : 'stats failed'));
  }
  return out;
}
