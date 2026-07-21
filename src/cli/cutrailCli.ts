import {
  Builtins,
  Cli,
} from 'clipanion';

import { createLaunchCommand } from './commands/Launch.command.ts';

type CutrailCliInput = {
  argv: string[];
  cwd: string;
  stderr: NodeJS.WriteStream;
  stdout: NodeJS.WriteStream;
  version: string;
};

type CutrailCliResult = {
  exitCode: number;
  shouldStartApp: boolean;
  startupPaths: string[];
};

const runCutrailCli = async ({
  argv,
  cwd,
  stderr,
  stdout,
  version,
}: CutrailCliInput): Promise<CutrailCliResult> => {
  let shouldStartApp = false;
  let startupPaths: string[] = [];

  const cli = new Cli({
    binaryLabel: 'Cutrail CLI',
    binaryName: 'cutrail',
    binaryVersion: version,
  });

  cli.register(createLaunchCommand({
    cwd,
    markShouldStartApp: () => {
      shouldStartApp = true;
    },
    setStartupPaths: (nextPaths) => {
      startupPaths = nextPaths;
    },
  }));
  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);

  const exitCode = await cli.run(argv, {
    stderr,
    stdout,
  });

  return {
    exitCode,
    shouldStartApp,
    startupPaths,
  };
};

export {
  runCutrailCli,
};
export type {
  CutrailCliResult,
};
