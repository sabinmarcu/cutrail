import { spawn } from 'node:child_process';

import { parseFfmpegProgressLine } from './parseFfmpegProgress.ts';
import { resolveFfmpegPath } from './resolveFfmpegPath.ts';

type DataEmitter = {
  on: (event: 'data', listener: (chunk: unknown) => void) => void;
};

type FfmpegJobProcess = {
  stderr: DataEmitter;
  once: (event: 'error' | 'close', listener: (...values: unknown[]) => void) => void;
};

type SpawnFfmpegProcess = (command: string, arguments_: string[], options: { stdio: ['ignore', 'ignore', 'pipe'] }) => FfmpegJobProcess;

export type RunFfmpegJobProgress = {
  jobId: string;
  processedSeconds: number | null;
  ratio: number | null;
  speed: number | null;
};

export type RunFfmpegJobResult = {
  status: 'COMPLETED' | 'FAILED';
  code: 'OK' | 'FFMPEG_SPAWN_ERROR' | 'FFMPEG_PROCESS_FAILED';
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stderrSummary: string;
  error?: string;
  jobId: string;
  durationMs: number;
};

export type RunFfmpegJobOptions = {
  jobId: string;
  args: string[];
  ffmpegPath?: string;
  totalDuration?: number;
  onProgress?: (payload: RunFfmpegJobProgress) => void;
  spawnImpl?: SpawnFfmpegProcess;
};

const summarizeStderr = (lines: string[], maxLines = 12): string => lines
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
  spawnImpl = spawn as unknown as SpawnFfmpegProcess,
}: RunFfmpegJobOptions): Promise<RunFfmpegJobResult> => {
  if (typeof jobId !== 'string' || jobId.trim().length === 0) {
    throw new TypeError('jobId must be a non-empty string');
  }

  if (!Array.isArray(args) || args.some((argument) => typeof argument !== 'string')) {
    throw new TypeError('args must be an array of strings');
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();
    /** @type {string[]} */
    const stderrLines: string[] = [];
    let stderrBuffer = '';
    let settled = false;

    const settle = (result: Omit<RunFfmpegJobResult, 'jobId' | 'durationMs'>) => {
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
      stderrBuffer += String(chunk);
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
      const errorMessage = error instanceof Error ? error.message : String(error);

      settle({
        status: 'FAILED',
        code: 'FFMPEG_SPAWN_ERROR',
        exitCode: null,
        signal: null,
        stderrSummary: summarizeStderr(stderrLines),
        error: errorMessage,
      });
    });

    child.once('close', (exitCodeRaw, signalRaw) => {
      const exitCode = typeof exitCodeRaw === 'number' ? exitCodeRaw : null;
      const signal = typeof signalRaw === 'string' ? signalRaw as NodeJS.Signals : null;

      if (stderrBuffer.length > 0) {
        stderrLines.push(stderrBuffer);
      }

      if (exitCode === 0) {
        if (typeof totalDuration === 'number' && Number.isFinite(totalDuration) && totalDuration > 0 && typeof onProgress === 'function') {
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
