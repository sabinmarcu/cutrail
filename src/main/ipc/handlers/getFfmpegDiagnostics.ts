import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

/** @returns {void} */
const registerGetFfmpegDiagnosticsHandler = () => {
  ipcMain.handle('cutrail:get-ffmpeg-diagnostics', async (event) => {
    assertTrustedSender(event);
    const { checkFfmpegAvailability } = await import('../../../infra/ffmpeg/checkFfmpegAvailability.ts');

    return checkFfmpegAvailability();
  });
};

export {
  registerGetFfmpegDiagnosticsHandler,
};
