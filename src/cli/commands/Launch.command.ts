import fsPromises from 'node:fs/promises';
import path from 'node:path';

import {
  Command,
  Option,
} from 'clipanion';
import type {
  BaseContext,
  CommandClass,
} from 'clipanion';

type LaunchCommandInput = {
  cwd: string;
  markShouldStartApp: () => void;
  setStartupPaths: (paths: string[]) => void;
};

const toUniquePaths = (pathsToNormalize: string[], cwd: string): string[] => {
  const unique = new Set<string>();

  for (const candidatePath of pathsToNormalize) {
    const normalized = path.resolve(cwd, candidatePath);

    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }

  return [...unique];
};

const validatePathsExist = async (
  resolvedPaths: string[],
): Promise<{ validPaths: string[]; missingPaths: string[] }> => {
  const validPaths: string[] = [];
  const missingPaths: string[] = [];

  for (const candidatePath of resolvedPaths) {
    try {
      await fsPromises.access(candidatePath);
      validPaths.push(candidatePath);
    } catch {
      missingPaths.push(candidatePath);
    }
  }

  return {
    validPaths,
    missingPaths,
  };
};

function createLaunchCommand({
  cwd,
  markShouldStartApp,
  setStartupPaths,
}: LaunchCommandInput): CommandClass<BaseContext> {
  class LaunchCommand extends Command<BaseContext> {
    static paths = [Command.Default];

    sourcePaths = Option.Rest();

    async execute(): Promise<number> {
      const resolvedPaths = toUniquePaths(this.sourcePaths, cwd);
      const { missingPaths, validPaths } = await validatePathsExist(resolvedPaths);

      if (missingPaths.length > 0) {
        for (const missingPath of missingPaths) {
          this.context.stderr.write(`Path not found: ${missingPath}\n`);
        }

        return 1;
      }

      setStartupPaths(validPaths);
      markShouldStartApp();

      return 0;
    }
  }

  return LaunchCommand;
}

export {
  createLaunchCommand,
};
