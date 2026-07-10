import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

/** @returns {void} */
const registerCheckFfmpegHandler = () => {
  ipcMain.handle('cutrail:check-ffmpeg', async (event) => {
    assertTrustedSender(event);
    const { checkFfmpegAvailability } = await import('../../../infra/ffmpeg/checkFfmpegAvailability.ts');

    return checkFfmpegAvailability();
  });
};

export {
  registerCheckFfmpegHandler,
};
