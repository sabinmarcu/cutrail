import path from 'node:path';
import {
  app,
} from 'electron';
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

const normalizePotentialFilePath = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.startsWith('-')) {
    return null;
  }

  return trimmed;
};

const findSupportedPathsFromArgv = (argv: string[]): string[] => argv
  .map(normalizePotentialFilePath)
  .filter((value): value is string => typeof value === 'string')
  .filter(hasSupportedVideoExtension);

const registerFileAssociationIntegration = ({
  openEditorWindow,
  startupFilePaths = [],
}: FileAssociationIntegrationDeps): FileAssociationIntegrationApi => {
  const startupPaths = [
    ...startupFilePaths.filter(hasSupportedVideoExtension),
    ...findSupportedPathsFromArgv(process.argv),
  ];
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

    pendingOpenFilePaths = [...pendingOpenFilePaths, filePath];
  });

  const singleInstanceLock = app.requestSingleInstanceLock();

  if (!singleInstanceLock) {
    app.quit();

    return {
      hasStartupVideoOpenRequest: () => false,
    };
  }

  app.on('second-instance', (_event, argv) => {
    const candidatePaths = findSupportedPathsFromArgv(argv);

    for (const candidatePath of candidatePaths) {
      openIfValid(candidatePath);
    }
  });

  app.whenReady().then(() => {
    if (pendingOpenFilePaths.length > 0) {
      for (const pendingPath of pendingOpenFilePaths) {
        openIfValid(pendingPath);
      }

      pendingOpenFilePaths = [];
    }

    for (const startupPath of startupPaths) {
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
