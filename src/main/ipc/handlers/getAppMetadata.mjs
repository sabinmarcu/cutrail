// @ts-check

import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/**
 * @param {{ getAppMetadata: () => Promise<{ version: string, copyright: string, attribution: string, license: string }> }} deps
 * @returns {void}
 */
const registerGetAppMetadataHandler = ({ getAppMetadata }) => {
  ipcMain.handle('cutrail:get-app-metadata', async (event) => {
    assertTrustedSender(event);

    return getAppMetadata();
  });
};

export {
  registerGetAppMetadataHandler,
};
