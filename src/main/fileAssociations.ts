import path from 'node:path';
import {
  app,
} from 'electron';
import { runCutrailCli } from '../cli/cutrailCli.ts';
import { validateSourceVideoFile } from './sourceSelection.ts';

const SUPPORTED_VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.webm', '.mov', '.avi']);

type FileAssociationIntegrationDeps = {
  openEditorWindow: (sourcePath: string) => boolean;
  startupFilePaths?: string[];
};

type FileAssociationIntegrationApi = {
  hasStartupVideoOpenRequest: () => boolean;
};

const hasSupportedVideoExtension = (filePath: string): boolean => {
  const extension = path.extname(filePath).toLowerCase();

  return SUPPORTED_VIDEO_EXTENSIONS.has(extension);
};

const toUniqueFilePaths = (paths: string[]): string[] => [...new Set(paths)];

const registerFileAssociationIntegration = ({
  openEditorWindow,
  startupFilePaths = [],
}: FileAssociationIntegrationDeps): FileAssociationIntegrationApi => {
  const startupPaths = toUniqueFilePaths(startupFilePaths.filter(hasSupportedVideoExtension));
  let pendingOpenFilePaths: string[] = [];

  const openIfValid = async (filePath: string): Promise<void> => {
    if (!hasSupportedVideoExtension(filePath)) {
      return;
    }

    const validation = await validateSourceVideoFile(filePath);

    if (validation.valid) {
      openEditorWindow(filePath);
    }
  };

  app.on('open-file', (event, filePath) => {
    event.preventDefault();

    if (!hasSupportedVideoExtension(filePath)) {
      return;
    }

    if (app.isReady()) {
      openIfValid(filePath);

      return;
    }

    if (!pendingOpenFilePaths.includes(filePath)) {
      pendingOpenFilePaths = [...pendingOpenFilePaths, filePath];
    }
  });

  const singleInstanceLock = app.requestSingleInstanceLock();

  if (!singleInstanceLock) {
    app.quit();

    return {
      hasStartupVideoOpenRequest: () => false,
    };
  }

  app.on('second-instance', (_event, argv) => {
    const argvWithoutRuntimePrefixes = argv.slice(2);

    runCutrailCli({
      argv: argvWithoutRuntimePrefixes,
      cwd: process.cwd(),
      stderr: process.stderr,
      stdout: process.stdout,
      version: app.getVersion(),
    }).then((result) => {
      if (result.exitCode !== 0 || result.startupPaths.length === 0) {
        return;
      }

      const candidatePaths = toUniqueFilePaths(result.startupPaths);

      for (const candidatePath of candidatePaths) {
        openIfValid(candidatePath);
      }
    }).catch((error) => {
      const errorText = error instanceof Error ? error.stack ?? error.message : String(error);
      process.stderr.write(`${errorText}\n`);
    });
  });

  app.whenReady().then(() => {
    const initialPaths = toUniqueFilePaths([
      ...pendingOpenFilePaths,
      ...startupPaths,
    ]);
    pendingOpenFilePaths = [];

    for (const startupPath of initialPaths) {
      openIfValid(startupPath);
    }
  });

  return {
    hasStartupVideoOpenRequest: () => startupPaths.length > 0 || pendingOpenFilePaths.length > 0,
  };
};

export {
  registerFileAssociationIntegration,
};
