import { spawn } from 'node:child_process';

import { parseFfmpegProgressLine } from './parseFfmpegProgress.js';
import { resolveFfmpegPath } from './resolveFfmpegPath.js';

const summarizeStderr = (lines, maxLines = 12) => lines
  .map((line) => line.trim())
  .filter((line) => line.length > 0)
  .slice(-maxLines)
  .join('\n');

export const runFfmpegJob = ({
  jobId,
  args,
  ffmpegPath = resolveFfmpegPath().path,
  totalDuration,
  onProgress,
  spawnImpl = spawn,
}) => {
  if (typeof jobId !== 'string' || jobId.trim().length === 0) {
    throw new TypeError('jobId must be a non-empty string');
  }

  if (!Array.isArray(args) || args.some((argument) => typeof argument !== 'string')) {
    throw new TypeError('args must be an array of strings');
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const stderrLines = [];
    let stderrBuffer = '';
    let settled = false;

    const settle = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve({
        ...result,
        jobId,
        durationMs: Date.now() - startedAt,
      });
    };

    const child = spawnImpl(ffmpegPath, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk.toString();
      const lines = stderrBuffer.split(/[\r\n]+/);
      stderrBuffer = lines.pop() ?? '';

      for (const line of lines) {
        stderrLines.push(line);

        const parsed = parseFfmpegProgressLine(line, { totalDuration });

        if (parsed && typeof onProgress === 'function') {
          onProgress({
            jobId,
            ...parsed,
          });
        }
      }
    });

    child.once('error', (error) => {
      settle({
        status: 'FAILED',
        code: 'FFMPEG_SPAWN_ERROR',
        exitCode: null,
        signal: null,
        stderrSummary: summarizeStderr(stderrLines),
        error: error.message,
      });
    });

    child.once('close', (exitCode, signal) => {
      if (stderrBuffer.length > 0) {
        stderrLines.push(stderrBuffer);
      }

      if (exitCode === 0) {
        if (Number.isFinite(totalDuration) && totalDuration > 0 && typeof onProgress === 'function') {
          onProgress({
            jobId,
            processedSeconds: totalDuration,
            ratio: 1,
            speed: null,
          });
        }

        settle({
          status: 'COMPLETED',
          code: 'OK',
          exitCode,
          signal,
          stderrSummary: summarizeStderr(stderrLines),
        });

        return;
      }

      settle({
        status: 'FAILED',
        code: 'FFMPEG_PROCESS_FAILED',
        exitCode,
        signal,
        stderrSummary: summarizeStderr(stderrLines),
      });
    });
  });
};
