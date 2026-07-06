// @ts-check

import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/**
 * @param {{ readThirdPartyNotices: () => Promise<string> }} deps
 * @returns {void}
 */
const registerGetThirdPartyNoticesHandler = ({ readThirdPartyNotices }) => {
  ipcMain.handle('cutrail:get-third-party-notices', async (event) => {
    assertTrustedSender(event);

    return readThirdPartyNotices();
  });
};

export {
  registerGetThirdPartyNoticesHandler,
};
