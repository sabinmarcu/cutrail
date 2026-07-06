export const MIN_RANGE_DURATION = 0.1;
export const DEFAULT_RANGE_DURATION = 5;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const buildRangeId = (ranges) => {
  const highest = ranges.reduce((max, range) => {
    const match = /range-(\d+)/.exec(String(range.id));

    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `range-${highest + 1}`;
};

export const normalizeVideoPath = (filePath) => {
  if (!filePath) {
    return '';
  }

  if (typeof globalThis.cutrail?.resolveMediaUrl === 'function') {
    return globalThis.cutrail.resolveMediaUrl(filePath);
  }

  return '';
};
