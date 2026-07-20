import { ipcMain } from 'electron';
import type { BinaryResolutionMode } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetFfmpegResolutionModeDeps = {
  getPersistedFfmpegResolutionMode: () => Promise<BinaryResolutionMode>;
};

const registerGetFfmpegResolutionModeHandler = ({
  getPersistedFfmpegResolutionMode,
}: GetFfmpegResolutionModeDeps): void => {
  ipcMain.handle('cutrail:get-ffmpeg-resolution-mode', async (event) => {
    assertTrustedSender(event);

    return getPersistedFfmpegResolutionMode();
  });
};

export {
  registerGetFfmpegResolutionModeHandler,
};
