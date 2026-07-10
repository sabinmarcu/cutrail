import fsPromises from 'node:fs/promises';
import type {
  BrowserWindow,
  OpenDialogOptions,
} from 'electron';
import { dialog } from 'electron';

type SourceValidationResult = { valid: true } | { valid: false; message: string };

const validateSourceVideoFile = async (filePath: string): Promise<SourceValidationResult> => {
  try {
    const stats = await fsPromises.stat(filePath);

    if (!stats.isFile()) {
      return {
        valid: false,
        message: 'Selected path is not a regular file.',
      };
    }

    if (stats.size <= 0) {
      return {
        valid: false,
        message: 'Selected video file is empty (0 bytes).',
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      message: 'Selected video file could not be read.',
    };
  }
};

const selectValidSourceVideo = async (
  parentWindow: BrowserWindow | null,
): Promise<string | null> => {
  const openDialogOptions: OpenDialogOptions = {
    properties: ['openFile'],
    filters: [
      {
        name: 'Video files',
        extensions: ['mp4', 'mkv', 'webm', 'mov', 'avi'],
      },
      {
        name: 'All files',
        extensions: ['*'],
      },
    ],
  };
  const result = parentWindow
    ? await dialog.showOpenDialog(parentWindow, openDialogOptions)
    : await dialog.showOpenDialog(openDialogOptions);

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  const validation = await validateSourceVideoFile(selectedPath);

  if (validation.valid === false) {
    const messageOptions = {
      type: 'error',
      title: 'Invalid Source Video',
      message: 'The selected source video cannot be loaded.',
      detail: `${validation.message}\n\nPath: ${selectedPath}`,
    } as const;

    await (parentWindow
      ? dialog.showMessageBox(parentWindow, messageOptions)
      : dialog.showMessageBox(messageOptions));

    return null;
  }

  return selectedPath;
};

export {
  selectValidSourceVideo,
  validateSourceVideoFile,
};
