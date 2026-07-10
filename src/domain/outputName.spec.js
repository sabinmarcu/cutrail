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
      range: {
        start: 65,
        end: 88,
      },
      trimMode: 'accurate',
    })).toBe('input_sample__accurate__00-01-05_00-01-28.mp4');
  });

  it('supports custom output extension', () => {
    expect(buildClipOutputName({
      sourcePath: '/videos/movie.mkv',
      range: {
        start: 1,
        end: 3,
      },
      extension: '.mkv',
    })).toBe('movie__fast__00-00-01_00-00-03.mkv');
  });
});

describe('parseClipOutputName', () => {
  it('parses deterministic clip output names', () => {
    expect(parseClipOutputName('input_sample__accurate__00-01-05_00-01-28.mp4')).toEqual({
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

  it('returns null for non-matching names', () => {
    expect(parseClipOutputName('input_sample__0001__00-01-05_00-01-28.mp4')).toBeNull();
  });
});

describe('normalizeClipSourceName', () => {
  it('normalizes a source path into a stable base name', () => {
    expect(normalizeClipSourceName('/videos/input sample.mp4')).toBe('input_sample');
  });
});
