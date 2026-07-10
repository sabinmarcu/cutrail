import { spawn } from 'node:child_process';

import { resolveFfmpegPath } from './resolveFfmpegPath.ts';

type DataEmitter = {
  on: (event: 'data', listener: (chunk: unknown) => void) => void;
};

type FfmpegVersionProcess = {
  stdout: DataEmitter;
  stderr: DataEmitter;
  once: (event: 'error' | 'close', listener: (...values: unknown[]) => void) => void;
};

type SpawnVersionProcess = (command: string, arguments_: string[], options: { stdio: ['ignore', 'pipe', 'pipe'] }) => FfmpegVersionProcess;

export type CheckFfmpegAvailabilityOptions = {
  spawnImpl?: SpawnVersionProcess;
  ffmpegPath?: string;
};

export type FfmpegAvailabilityResult = {
  available: boolean;
  path: string;
  source: string;
  code?: string;
  error?: string;
  versionLine?: string;
};

export const checkFfmpegAvailability = ({
  spawnImpl = spawn as unknown as SpawnVersionProcess,
  ffmpegPath,
}: CheckFfmpegAvailabilityOptions = {}): Promise<FfmpegAvailabilityResult> => {
  const resolution = ffmpegPath
    ? {
      path: ffmpegPath,
      source: 'CUSTOM',
    }
    : resolveFfmpegPath();

  return new Promise((resolve) => {
    const child = spawnImpl(resolution.path, ['-version'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const settle = (value: FfmpegAvailabilityResult) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    };

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.once('error', (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);

      settle({
        available: false,
        path: resolution.path,
        source: resolution.source,
        code: 'FFMPEG_NOT_FOUND',
        error: errorMessage,
      });
    });

    child.once('close', (exitCode) => {
      if (exitCode !== 0) {
        settle({
          available: false,
          path: resolution.path,
          source: resolution.source,
          code: 'FFMPEG_CHECK_FAILED',
          error: stderr.trim() || `ffmpeg exited with code ${String(exitCode)}`,
        });

        return;
      }

      const firstLine = stdout.split(/\r?\n/u).find((line) => line.trim().length > 0) ?? '';

      settle({
        available: true,
        path: resolution.path,
        source: resolution.source,
        versionLine: firstLine,
      });
    });
  });
};
