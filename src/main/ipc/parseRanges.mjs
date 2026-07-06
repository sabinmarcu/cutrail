// @ts-check

/**
 * @typedef {{ id?: string, start?: unknown, end?: unknown }} RangeLike
 */

/**
 * @typedef {{ id: string, start: number, end: number }} ParsedRange
 */

/**
 * @param {unknown} value
 * @returns {number}
 */
const toNumber = (value) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/**
 * @param {unknown} ranges
 * @returns {ParsedRange[]}
 */
const parseRanges = (ranges) => {
  if (!Array.isArray(ranges)) {
    throw new TypeError('ranges must be an array');
  }

  return ranges.map((range, index) => {
    /** @type {RangeLike} */
    const nextRange = typeof range === 'object' && range !== null ? range : {};

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
