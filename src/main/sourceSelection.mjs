// @ts-check

import fsPromises from 'node:fs/promises';
import { dialog } from 'electron';

/**
 * @typedef {{ valid: true } | { valid: false, message: string }} SourceValidationResult
 */

/**
 * @param {string} filePath
 * @returns {Promise<SourceValidationResult>}
 */
const validateSourceVideoFile = async (filePath) => {
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

/**
 * @param {import('electron').BrowserWindow | null} parentWindow
 * @returns {Promise<string | null>}
 */
const selectValidSourceVideo = async (parentWindow) => {
  const result = await dialog.showOpenDialog(parentWindow, {
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
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  const validation = await validateSourceVideoFile(selectedPath);

  if (validation.valid === false) {
    await dialog.showMessageBox(parentWindow, {
      type: 'error',
      title: 'Invalid Source Video',
      message: 'The selected source video cannot be loaded.',
      detail: `${validation.message}\n\nPath: ${selectedPath}`,
    });

    return null;
  }

  return selectedPath;
};

export {
  selectValidSourceVideo,
};
