import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  buildClipOutputName,
  formatClipTimestamp,
  normalizeClipSourceName,
  parseClipOutputName,
} from './outputName.ts';

describe('formatClipTimestamp', () => {
  it('formats seconds as HH-MM-SS-mmm', () => {
    expect(formatClipTimestamp(3661)).toBe('01-01-01-000');
  });

  it('preserves millisecond precision in output timestamps', () => {
    expect(formatClipTimestamp(3661.789)).toBe('01-01-01-789');
  });
});

describe('buildClipOutputName', () => {
  it('builds deterministic clip output names', () => {
    expect(buildClipOutputName({
      sourcePath: '/videos/input sample.mp4',
      range: {
        start: 65,
        end: 88,
      },
      trimMode: 'accurate',
      variantKey: 'trim=accurate|selected=1,3|muted=2',
    })).toBe('input_sample__accurate__00-01-05-000_00-01-28-000__v-dae1fa92.mp4');
  });

  it('supports custom output extension', () => {
    expect(buildClipOutputName({
      sourcePath: '/videos/movie.mkv',
      range: {
        start: 1,
        end: 3,
      },
      extension: '.mkv',
    })).toBe('movie__fast__00-00-01-000_00-00-03-000.mkv');
  });
});

describe('parseClipOutputName', () => {
  it('parses deterministic clip output names', () => {
    expect(parseClipOutputName('input_sample__accurate__00-01-05-000_00-01-28-000__v-dae1fa92.mp4')).toEqual({
      sourceName: 'input_sample',
      trimMode: 'accurate',
      range: {
        start: 65,
        end: 88,
        duration: 23,
      },
      extension: 'mp4',
    });
  });

  it('continues to parse legacy second-precision names', () => {
    expect(parseClipOutputName('input_sample__accurate__00-01-05_00-01-28__v-dae1fa92.mp4')).toEqual({
      sourceName: 'input_sample',
      trimMode: 'accurate',
      range: {
        start: 65,
        end: 88,
        duration: 23,
      },
      extension: 'mp4',
    });
  });

  it('parses millisecond-precision names', () => {
    expect(parseClipOutputName('input_sample__fast__00-01-05-125_00-01-28-500.mp4')).toEqual({
      sourceName: 'input_sample',
      trimMode: 'fast',
      range: {
        start: 65.125,
        end: 88.5,
        duration: 23.375,
      },
      extension: 'mp4',
    });
  });

  it('returns null for non-matching names', () => {
    expect(parseClipOutputName('input_sample__0001__00-01-05_00-01-28.mp4')).toBeNull();
  });
});

describe('normalizeClipSourceName', () => {
  it('normalizes a source path into a stable base name', () => {
    expect(normalizeClipSourceName('/videos/input sample.mp4')).toBe('input_sample');
  });
});
