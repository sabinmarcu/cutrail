import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  normalizeClipRanges,
  normalizeRange,
  validateRange,
} from './clipRange.ts';

describe('normalizeRange', () => {
  it('orders inverted ranges and calculates duration', () => {
    expect(normalizeRange(12, 3)).toEqual({
      start: 3,
      end: 12,
      duration: 9,
    });
  });

  it('clamps negative start values at zero', () => {
    expect(normalizeRange(-4, 6)).toEqual({
      start: 0,
      end: 6,
      duration: 6,
    });
  });
});

describe('validateRange', () => {
  it('marks short ranges as invalid', () => {
    expect(validateRange({
      start: 4,
      end: 4.02,
    }, { minimumDurationSeconds: 0.1 })).toMatchObject({
      valid: false,
      code: 'RANGE_TOO_SHORT',
    });
  });

  it('accepts ranges above minimum duration', () => {
    expect(validateRange({
      start: 1,
      end: 2,
    }, { minimumDurationSeconds: 0.1 })).toMatchObject({
      valid: true,
      code: 'VALID',
      normalized: {
        start: 1,
        end: 2,
        duration: 1,
      },
    });
  });
});

describe('normalizeClipRanges', () => {
  it('sorts valid ranges and reports overlap errors when overlaps are disabled', () => {
    const result = normalizeClipRanges([
      {
        id: 'b',
        start: 10,
        end: 14,
      },
      {
        id: 'a',
        start: 2,
        end: 5,
      },
      {
        id: 'c',
        start: 4,
        end: 7,
      },
    ]);

    expect(result.ranges.map((range: { id: string }) => range.id)).toEqual(['a', 'c', 'b']);
    expect(result.errors.map((error: { code: string }) => error.code)).toContain('RANGE_OVERLAP');
  });

  it('allows overlaps when configured', () => {
    const result = normalizeClipRanges([
      {
        id: 'one',
        start: 0,
        end: 3,
      },
      {
        id: 'two',
        start: 2,
        end: 4,
      },
    ], {
      allowOverlaps: true,
    });

    expect(result.errors).toEqual([]);
    expect(result.ranges).toHaveLength(2);
  });
});
