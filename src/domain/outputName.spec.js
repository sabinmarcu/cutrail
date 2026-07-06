import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  buildClipOutputName,
  formatClipTimestamp,
} from './outputName';

describe('formatClipTimestamp', () => {
  it('formats seconds as HH-MM-SS', () => {
    expect(formatClipTimestamp(3661)).toBe('01-01-01');
  });
});

describe('buildClipOutputName', () => {
  it('builds deterministic clip output names', () => {
    expect(buildClipOutputName({
      sourcePath: '/videos/input sample.mp4',
      clipIndex: 3,
      range: {
        start: 65,
        end: 88,
      },
    })).toBe('input_sample__0004__00-01-05_00-01-28.mp4');
  });

  it('supports custom output extension', () => {
    expect(buildClipOutputName({
      sourcePath: '/videos/movie.mkv',
      clipIndex: 0,
      range: {
        start: 1,
        end: 3,
      },
      extension: '.mkv',
    })).toBe('movie__0001__00-00-01_00-00-03.mkv');
  });
});
