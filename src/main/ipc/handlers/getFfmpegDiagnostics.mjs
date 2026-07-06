// @ts-check

import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/** @returns {void} */
const registerGetFfmpegDiagnosticsHandler = () => {
  ipcMain.handle('cutrail:get-ffmpeg-diagnostics', async (event) => {
    assertTrustedSender(event);
    const { checkFfmpegAvailability } = await import('../../../infra/ffmpeg/checkFfmpegAvailability.js');

    return checkFfmpegAvailability();
  });
};

export {
  registerGetFfmpegDiagnosticsHandler,
};
