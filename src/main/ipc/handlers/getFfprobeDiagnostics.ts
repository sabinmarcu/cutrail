import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

/** @returns {void} */
const registerGetFfprobeDiagnosticsHandler = () => {
  ipcMain.handle('cutrail:get-ffprobe-diagnostics', async (event) => {
    assertTrustedSender(event);
    const { checkFfprobeAvailability } = await import('../../../infra/ffmpeg/checkFfprobeAvailability.ts');

    return checkFfprobeAvailability();
  });
};

export {
  registerGetFfprobeDiagnosticsHandler,
};
