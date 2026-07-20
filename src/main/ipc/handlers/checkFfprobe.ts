import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

/** @returns {void} */
const registerCheckFfprobeHandler = () => {
  ipcMain.handle('cutrail:check-ffprobe', async (event) => {
    assertTrustedSender(event);
    const { checkFfprobeAvailability } = await import('../../../infra/ffmpeg/checkFfprobeAvailability.ts');

    return checkFfprobeAvailability();
  });
};

export {
  registerCheckFfprobeHandler,
};
