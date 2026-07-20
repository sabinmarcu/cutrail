export type RangeSecondsLike = {
  start: number;
  end: number;
  duration?: number;
};

export type RangeMilliseconds = {
  startMs: number;
  endMs: number;
  durationMs: number;
};

const toMilliseconds = (seconds: number): number => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new TypeError('seconds must be a non-negative finite number');
  }

  return Math.round(seconds * 1000);
};

export const normalizeRangeMilliseconds = (range: RangeSecondsLike): RangeMilliseconds => {
  const startMs = toMilliseconds(Math.min(range.start, range.end));
  const endMs = toMilliseconds(Math.max(range.start, range.end));

  return {
    startMs,
    endMs,
    durationMs: Math.max(0, endMs - startMs),
  };
};

export const createRangeKey = (rangeMs: RangeMilliseconds): string => (
  `${rangeMs.startMs}:${rangeMs.endMs}:${rangeMs.durationMs}`
);

export const normalizeTrackIndices = (trackIndices: readonly number[] | undefined): number[] => {
  if (!Array.isArray(trackIndices)) {
    return [];
  }

  const validIndices = trackIndices.filter(
    (value): value is number => Number.isInteger(value) && value >= 0,
  );

  return [...new Set(validIndices)].sort((left, right) => left - right);
};
