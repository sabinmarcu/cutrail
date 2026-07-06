const TIMESTAMP_PATTERN = /time=(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/;
const OUT_TIME_PATTERN = /^out_time=(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)$/;
const OUT_TIME_MS_PATTERN = /^out_time_ms=(\d+)$/;
const SPEED_PATTERN = /speed=\s*([0-9.]+)x/;
const SPEED_VALUE_PATTERN = /^speed=\s*([0-9.]+)x?$/;

const toSeconds = (hours, minutes, seconds) => (
  Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
);

export const parseFfmpegProgressLine = (line, options = {}) => {
  if (typeof line !== 'string') {
    return null;
  }

  const trimmed = line.trim();
  let processedSeconds = null;
  const timeMatch = trimmed.match(TIMESTAMP_PATTERN);
  const outTimeMatch = trimmed.match(OUT_TIME_PATTERN);
  const outTimeMsMatch = trimmed.match(OUT_TIME_MS_PATTERN);

  if (timeMatch) {
    processedSeconds = toSeconds(timeMatch[1], timeMatch[2], timeMatch[3]);
  } else if (outTimeMatch) {
    processedSeconds = toSeconds(outTimeMatch[1], outTimeMatch[2], outTimeMatch[3]);
  } else if (outTimeMsMatch) {
    processedSeconds = Number(outTimeMsMatch[1]) / 1_000_000;
  }

  if (!Number.isFinite(processedSeconds)) {
    return null;
  }

  const speedMatch = trimmed.match(SPEED_PATTERN) ?? trimmed.match(SPEED_VALUE_PATTERN);
  const speed = speedMatch ? Number(speedMatch[1]) : null;
  const { totalDuration } = options;

  return {
    processedSeconds,
    ratio: Number.isFinite(totalDuration) && totalDuration > 0
      ? Math.min(1, processedSeconds / totalDuration)
      : null,
    speed,
  };
};
