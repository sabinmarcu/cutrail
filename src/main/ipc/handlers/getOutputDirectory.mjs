// @ts-check

import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/**
 * @param {{ getPersistedOutputDirectory: () => Promise<string | null> }} deps
 * @returns {void}
 */
const registerGetOutputDirectoryHandler = ({ getPersistedOutputDirectory }) => {
  ipcMain.handle('cutrail:get-output-directory', async (event) => {
    assertTrustedSender(event);

    return getPersistedOutputDirectory();
  });
};

export {
  registerGetOutputDirectoryHandler,
};
