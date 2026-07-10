import path from 'node:path';

import { normalizeClipRanges } from './clipRange.ts';
import { buildClipOutputName } from './outputName.ts';

export type ExportRangeInput = {
  id?: string;
  start: number;
  end: number;
  duration?: number;
};

export type BuildExportJobsInput = {
  sourcePath: string;
  outputDirectory: string;
  ranges: ExportRangeInput[];
  extension?: string;
  trimMode?: 'fast' | 'accurate';
  options?: { minimumDurationSeconds?: number; allowOverlaps?: boolean };
};

export const buildExportJobs = ({
  sourcePath,
  outputDirectory,
  ranges,
  extension = 'mp4',
  trimMode = 'fast',
  options = {},
}: BuildExportJobsInput) => {
  if (typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
    throw new TypeError('sourcePath must be a non-empty string');
  }

  if (typeof outputDirectory !== 'string' || outputDirectory.trim().length === 0) {
    throw new TypeError('outputDirectory must be a non-empty string');
  }

  const normalized = normalizeClipRanges(ranges, options);

  const jobs = normalized.ranges.map((range) => {
    const outputName = buildClipOutputName({
      sourcePath,
      range,
      extension,
      trimMode,
    });

    return {
      id: range.id,
      inputPath: sourcePath,
      outputPath: path.join(outputDirectory, outputName),
      range,
    };
  });

  return {
    jobs,
    errors: normalized.errors,
  };
};
