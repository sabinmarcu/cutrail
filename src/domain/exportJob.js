import path from 'node:path';

import { normalizeClipRanges } from './clipRange.js';
import { buildClipOutputName } from './outputName.js';

export const buildExportJobs = ({
  sourcePath,
  outputDirectory,
  ranges,
  extension = 'mp4',
  options = {},
}) => {
  if (typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
    throw new TypeError('sourcePath must be a non-empty string');
  }

  if (typeof outputDirectory !== 'string' || outputDirectory.trim().length === 0) {
    throw new TypeError('outputDirectory must be a non-empty string');
  }

  const normalized = normalizeClipRanges(ranges, options);

  const jobs = normalized.ranges.map((range, clipIndex) => {
    const outputName = buildClipOutputName({
      sourcePath,
      clipIndex,
      range,
      extension,
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
