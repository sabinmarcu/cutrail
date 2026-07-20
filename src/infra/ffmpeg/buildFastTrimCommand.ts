import path from 'node:path';
import type { ExportClipMetadata } from '../../shared/exportMetadata.ts';
import { buildExportMetadataArguments } from './exportMetadataArgs.ts';

export type TrimRange = { start: number; duration: number };
export type BuildFastTrimCommandInput = {
  inputPath: string;
  outputPath: string;
  range: TrimRange;
  trimMode?: 'fast' | 'accurate';
  audioStreamIndices?: number[];
  metadata?: ExportClipMetadata;
};

const assertValidAudioStreamIndices = (audioStreamIndices: number[]): void => {
  if (!Array.isArray(audioStreamIndices)) {
    throw new TypeError('audioStreamIndices must be an array of non-negative integers');
  }

  if (audioStreamIndices.some((index) => !Number.isInteger(index) || index < 0)) {
    throw new TypeError('audioStreamIndices must be an array of non-negative integers');
  }
};

const buildAudioMixFilter = (audioStreamIndices: number[]): string => (
  `${audioStreamIndices.map((index) => `[0:a:${index}]`).join('')}amix=inputs=${audioStreamIndices.length}:duration=longest:dropout_transition=0[aout]`
);

const buildAudioArguments = (
  audioStreamIndices: number[] | undefined,
): { args: string[]; hasAudioOutput: boolean } => {
  if (audioStreamIndices === undefined) {
    return {
      args: ['-map', '0:a?'],
      hasAudioOutput: true,
    };
  }

  assertValidAudioStreamIndices(audioStreamIndices);

  if (audioStreamIndices.length === 0) {
    return {
      args: [],
      hasAudioOutput: false,
    };
  }

  if (audioStreamIndices.length === 1) {
    return {
      args: ['-map', `0:a:${audioStreamIndices[0]}?`],
      hasAudioOutput: true,
    };
  }

  return {
    args: [
      '-filter_complex',
      buildAudioMixFilter(audioStreamIndices),
      '-map',
      '[aout]',
    ],
    hasAudioOutput: true,
  };
};

const toFfmpegSeconds = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new TypeError('seconds must be a non-negative finite number');
  }

  return seconds.toFixed(3);
};

export const buildFastTrimCommand = ({
  inputPath,
  outputPath,
  range,
  trimMode = 'accurate',
  audioStreamIndices,
  metadata,
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
  const audioSelection = buildAudioArguments(audioStreamIndices);
  const audioArguments = audioSelection.args;
  const { hasAudioOutput } = audioSelection;
  const metadataArguments = metadata ? buildExportMetadataArguments(metadata) : [];

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
      ...audioArguments,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      ...(hasAudioOutput
        ? [
          '-c:a',
          'aac',
          '-b:a',
          '192k',
        ]
        : ['-an']),
      ...metadataArguments,
      '-movflags',
      '+faststart+use_metadata_tags',
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
      ...audioArguments,
      '-c:v',
      'copy',
      ...(hasAudioOutput ? ['-c:a', 'aac', '-b:a', '192k'] : ['-an']),
      ...metadataArguments,
      '-movflags',
      '+faststart+use_metadata_tags',
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
    ...audioArguments,
    '-map',
    '0:s?',
    ...(hasAudioOutput
      ? (audioStreamIndices === undefined || audioStreamIndices.length === 1
        ? ['-c', 'copy']
        : ['-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-c:s', 'copy'])
      : ['-c:v', 'copy', '-c:s', 'copy', '-an']),
    ...metadataArguments,
    '-y',
    outputPath,
  ];
};
