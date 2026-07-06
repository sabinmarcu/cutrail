// @ts-check

import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/** @returns {void} */
const registerCheckFfmpegHandler = () => {
  ipcMain.handle('cutrail:check-ffmpeg', async (event) => {
    assertTrustedSender(event);
    const { checkFfmpegAvailability } = await import('../../../infra/ffmpeg/checkFfmpegAvailability.js');

    return checkFfmpegAvailability();
  });
};

export {
  registerCheckFfmpegHandler,
};
