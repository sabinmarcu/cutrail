const DEFAULT_MINIMUM_DURATION_SECONDS = 0.1;

export type NormalizedRange = { start: number; end: number; duration: number };
export type ClipRangeInput = { id?: string; start: number; end: number };
export type NormalizeClipRangesOptions = {
  minimumDurationSeconds?: number;
  allowOverlaps?: boolean;
};

export type ValidateRangeResult = {
  valid: boolean;
  code: 'RANGE_TOO_SHORT' | 'VALID';
  normalized: NormalizedRange;
};

export type NormalizedClipRange = NormalizedRange & {
  id: string;
  sourceIndex: number;
};

export type ClipRangeError = {
  id: string;
  sourceIndex: number;
  code: string;
  normalized: NormalizedRange;
};

export const normalizeRange = (startSeconds: number, endSeconds: number): NormalizedRange => {
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) {
    throw new TypeError('startSeconds and endSeconds must be finite numbers');
  }

  const start = Math.max(0, Math.min(startSeconds, endSeconds));
  const end = Math.max(startSeconds, endSeconds);

  return {
    start,
    end,
    duration: end - start,
  };
};

export const validateRange = (
  range: ClipRangeInput,
  options: NormalizeClipRangesOptions = {},
): ValidateRangeResult => {
  const minimumDurationSeconds = options.minimumDurationSeconds ?? DEFAULT_MINIMUM_DURATION_SECONDS;

  if (!Number.isFinite(minimumDurationSeconds) || minimumDurationSeconds < 0) {
    throw new TypeError('minimumDurationSeconds must be a non-negative finite number');
  }

  const normalized = normalizeRange(range.start, range.end);

  if (normalized.duration < minimumDurationSeconds) {
    return {
      valid: false,
      code: 'RANGE_TOO_SHORT',
      normalized,
    };
  }

  return {
    valid: true,
    code: 'VALID',
    normalized,
  };
};

export const normalizeClipRanges = (
  ranges: ClipRangeInput[],
  options: NormalizeClipRangesOptions = {},
): { ranges: NormalizedClipRange[]; errors: ClipRangeError[] } => {
  if (!Array.isArray(ranges)) {
    throw new TypeError('ranges must be an array');
  }

  const allowOverlaps = options.allowOverlaps ?? false;

  const normalizedWithSourceIndex = ranges.map((range, sourceIndex) => {
    if (!range || typeof range !== 'object') {
      throw new TypeError(`range at index ${sourceIndex} must be an object`);
    }

    return {
      sourceIndex,
      id: range.id ?? `range-${sourceIndex + 1}`,
      ...validateRange(range, options),
    };
  });

  const validRanges: NormalizedClipRange[] = normalizedWithSourceIndex
    .filter((range) => range.valid)
    .map((range) => ({
      id: range.id,
      sourceIndex: range.sourceIndex,
      ...range.normalized,
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end || a.sourceIndex - b.sourceIndex);

  const errors: ClipRangeError[] = normalizedWithSourceIndex
    .filter((range) => !range.valid)
    .map((range) => ({
      id: range.id,
      sourceIndex: range.sourceIndex,
      code: range.code,
      normalized: range.normalized,
    }));

  if (!allowOverlaps) {
    for (let index = 1; index < validRanges.length; index += 1) {
      const previous = validRanges[index - 1];
      const current = validRanges[index];

      if (current.start < previous.end) {
        errors.push({
          id: current.id,
          sourceIndex: current.sourceIndex,
          code: 'RANGE_OVERLAP',
          normalized: current,
        });
      }
    }
  }

  return {
    ranges: validRanges,
    errors,
  };
};
