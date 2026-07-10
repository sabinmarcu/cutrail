import path from 'node:path';

export type TrimRange = { start: number; duration: number };
export type BuildFastTrimCommandInput = {
  inputPath: string;
  outputPath: string;
  range: TrimRange;
  trimMode?: 'fast' | 'accurate';
};

const toFfmpegSeconds = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new TypeError('seconds must be a non-negative finite number');
  }

  return seconds.toFixed(3);
};

export const buildFastTrimCommand = ({
  inputPath, outputPath, range, trimMode = 'accurate',
}: BuildFastTrimCommandInput): string[] => {
  if (typeof inputPath !== 'string' || inputPath.trim().length === 0) {
    throw new TypeError('inputPath must be a non-empty string');
  }

  if (typeof outputPath !== 'string' || outputPath.trim().length === 0) {
    throw new TypeError('outputPath must be a non-empty string');
  }

  if (!range || !Number.isFinite(range.start) || !Number.isFinite(range.duration)) {
    throw new TypeError('range must include finite start and duration values');
  }

  if (range.duration <= 0) {
    throw new RangeError('range.duration must be greater than 0');
  }

  const outputExtension = path.extname(outputPath).toLowerCase();

  // Use accurate trim for MP4 outputs to avoid keyframe-boundary artifacts at clip start.
  // This re-encodes both video and audio for clean first frames/samples.
  if (outputExtension === '.mp4' && trimMode === 'accurate') {
    return [
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-i',
      inputPath,
      '-ss',
      toFfmpegSeconds(range.start),
      '-t',
      toFfmpegSeconds(range.duration),
      '-map',
      '0:v:0?',
      '-map',
      '0:a?',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart',
      '-y',
      outputPath,
    ];
  }

  if (outputExtension === '.mp4') {
    return [
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-ss',
      toFfmpegSeconds(range.start),
      '-i',
      inputPath,
      '-t',
      toFfmpegSeconds(range.duration),
      '-map',
      '0:v:0?',
      '-map',
      '0:a?',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart',
      '-y',
      outputPath,
    ];
  }

  return [
    '-hide_banner',
    '-loglevel',
    'error',
    '-progress',
    'pipe:2',
    '-nostats',
    '-ss',
    toFfmpegSeconds(range.start),
    '-i',
    inputPath,
    '-t',
    toFfmpegSeconds(range.duration),
    '-map',
    '0:v:0?',
    '-map',
    '0:a?',
    '-map',
    '0:s?',
    '-c',
    'copy',
    '-y',
    outputPath,
  ];
};
