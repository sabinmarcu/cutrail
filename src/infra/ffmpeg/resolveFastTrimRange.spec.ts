import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  resolveFastTrimRange,
  resolveSnappedTrimRange,
} from './resolveFastTrimRange.ts';

describe('resolveFastTrimRange', () => {
  it('returns input range when probe fails or yields no keyframes', async () => {
    const range = await resolveFastTrimRange({
      inputPath: '/videos/input.mp4',
      range: {
        start: 10,
        duration: 4,
      },
    });

    expect(range).toEqual({
      start: 10,
      duration: 4,
    });
  });

  it('returns original range for invalid durations', async () => {
    const range = await resolveFastTrimRange({
      inputPath: '/videos/input.mp4',
      range: {
        start: 9,
        duration: 0,
      },
    });

    expect(range).toEqual({
      start: 9,
      duration: 0,
    });
  });

  it('snaps range to previous start keyframe and next end keyframe', () => {
    const range = resolveSnappedTrimRange([24.000_02, 26.000_003, 32.000_004], {
      start: 24.627,
      duration: 5,
    });

    expect(range).toMatchObject({
      start: 24.000_02,
    });
    expect(range.duration).toBeCloseTo(7.999_983, 3);
  });

  it('keeps requested end when there is no later keyframe', () => {
    const range = resolveSnappedTrimRange([54.000_004, 56.000_003, 58.000_001], {
      start: 59.9,
      duration: 2,
    });

    expect(range).toMatchObject({
      start: 58.000_001,
    });
    expect(range.duration).toBeCloseTo(3.899_999, 3);
  });

  it('snaps correctly when keyframe points are unsorted', () => {
    const points = [32.000_004, 0, 24.000_02, 26.000_003];
    const sortedPoints = [...points].sort((left, right) => left - right);
    const range = resolveSnappedTrimRange(sortedPoints, {
      start: 24.907,
      duration: 5,
    });

    expect(range.start).toBeCloseTo(24.000_02, 5);
    expect(range.duration).toBeCloseTo(7.999_984, 3);
  });
});
