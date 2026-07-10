type ParsedRange = {
  id: string;
  start: number;
  end: number;
};

/**
 * @param {unknown} value
 * @returns {number}
 */
const toNumber = (value: unknown): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/**
 * @param {unknown} ranges
 * @returns {ParsedRange[]}
 */
const parseRanges = (ranges: unknown): ParsedRange[] => {
  if (!Array.isArray(ranges)) {
    throw new TypeError('ranges must be an array');
  }

  return ranges.map((range, index) => {
    const nextRange: { id?: string; start?: unknown; end?: unknown } = typeof range === 'object' && range !== null
      ? range as { id?: string; start?: unknown; end?: unknown }
      : {};

    return {
      id: typeof nextRange.id === 'string' && nextRange.id.length > 0 ? nextRange.id : `range-${index + 1}`,
      start: toNumber(nextRange.start),
      end: toNumber(nextRange.end),
    };
  });
};

export {
  parseRanges,
  toNumber,
};
