import { spawn } from 'node:child_process';

import { resolveFfprobeCandidates } from './resolveFfprobeCandidates.ts';

type DataEmitter = {
  on: (event: 'data', listener: (chunk: unknown) => void) => void;
};

type FfprobeVersionProcess = {
  stdout: DataEmitter;
  stderr: DataEmitter;
  once: (event: 'error' | 'close', listener: (...values: unknown[]) => void) => void;
};

type SpawnVersionProcess = (command: string, arguments_: string[], options: { stdio: ['ignore', 'pipe', 'pipe'] }) => FfprobeVersionProcess;

export type CheckFfprobeAvailabilityOptions = {
  spawnImpl?: SpawnVersionProcess;
  ffprobePath?: string;
};

export type FfprobeAvailabilityResult = {
  available: boolean;
  path: string;
  source: string;
  code?: string;
  error?: string;
  versionLine?: string;
};

const sourceForPath = (path: string, index: number): string => {
  if (path === 'ffprobe') {
    return 'SYSTEM_PATH';
  }

  return index === 0 ? 'SIBLING_BUNDLED' : 'BUNDLED';
};

export const checkFfprobeAvailability = ({
  spawnImpl = spawn as unknown as SpawnVersionProcess,
  ffprobePath,
}: CheckFfprobeAvailabilityOptions = {}): Promise<FfprobeAvailabilityResult> => {
  const candidates = ffprobePath ? [ffprobePath] : resolveFfprobeCandidates();

  return new Promise((resolve) => {
    const tryNextCandidate = (candidateIndex: number): void => {
      const command = candidates[candidateIndex];

      if (!command) {
        resolve({
          available: false,
          path: 'ffprobe',
          source: 'SYSTEM_PATH',
          code: 'FFPROBE_NOT_FOUND',
          error: 'ffprobe could not be resolved',
        });

        return;
      }

      const child = spawnImpl(command, ['-version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => {
        stdout += String(chunk);
      });

      child.stderr.on('data', (chunk) => {
        stderr += String(chunk);
      });

      child.once('error', (error) => {
        if (ffprobePath) {
          const errorMessage = error instanceof Error ? error.message : String(error);

          resolve({
            available: false,
            path: command,
            source: sourceForPath(command, candidateIndex),
            code: 'FFPROBE_NOT_FOUND',
            error: errorMessage,
          });

          return;
        }

        tryNextCandidate(candidateIndex + 1);
      });

      child.once('close', (exitCode) => {
        if (exitCode !== 0) {
          if (ffprobePath) {
            resolve({
              available: false,
              path: command,
              source: sourceForPath(command, candidateIndex),
              code: 'FFPROBE_CHECK_FAILED',
              error: stderr.trim() || `ffprobe exited with code ${String(exitCode)}`,
            });

            return;
          }

          tryNextCandidate(candidateIndex + 1);

          return;
        }

        const firstLine = stdout.split(/\r?\n/u).find((line) => line.trim().length > 0) ?? '';

        resolve({
          available: true,
          path: command,
          source: sourceForPath(command, candidateIndex),
          versionLine: firstLine,
        });
      });
    };

    tryNextCandidate(0);
  });
};
