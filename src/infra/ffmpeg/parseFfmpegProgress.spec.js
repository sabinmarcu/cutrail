import {
  describe,
  expect,
  it,
} from 'vitest';

import { parseFfmpegProgressLine } from './parseFfmpegProgress';

describe('parseFfmpegProgressLine', () => {
  it('extracts processed time, ratio, and speed from ffmpeg stderr output', () => {
    expect(parseFfmpegProgressLine(
      'frame=102 fps=60.0 time=00:00:05.00 bitrate=1000.0kbits/s speed=1.50x',
      { totalDuration: 10 },
    )).toEqual({
      processedSeconds: 5,
      ratio: 0.5,
      speed: 1.5,
    });
  });

  it('returns null when the line does not contain progress data', () => {
    expect(parseFfmpegProgressLine('Input #0, mov,mp4,m4a,3gp,3g2,mj2, from file')).toBeNull();
  });

  it('extracts processed time from ffmpeg -progress out_time lines', () => {
    expect(parseFfmpegProgressLine('out_time=00:00:03.250000', { totalDuration: 10 })).toEqual({
      processedSeconds: 3.25,
      ratio: 0.325,
      speed: null,
    });
  });

  it('extracts processed time from ffmpeg -progress out_time_ms lines', () => {
    expect(parseFfmpegProgressLine('out_time_ms=2500000', { totalDuration: 10 })).toEqual({
      processedSeconds: 2.5,
      ratio: 0.25,
      speed: null,
    });
  });
});
