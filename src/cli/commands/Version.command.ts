import {
  Command,
} from 'clipanion';
import type {
  BaseContext,
  CommandClass,
} from 'clipanion';

type VersionCommandInput = {
  version: string;
  stdout: NodeJS.WriteStream;
};

const createVersionCommand = ({
  version,
  stdout,
}: VersionCommandInput): CommandClass<BaseContext> => {
  return class VersionCommand extends Command<BaseContext> {
    static paths = [['--version'], ['-v']];

    async execute(): Promise<number> {
      stdout.write(`${version}\n`);

      return 0;
    }
  };
};

export {
  createVersionCommand,
};
