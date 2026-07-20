import { ipcMain } from 'electron';
import type { BinaryResolutionMode } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetFfprobeResolutionModeDeps = {
  getPersistedFfprobeResolutionMode: () => Promise<BinaryResolutionMode>;
};

const registerGetFfprobeResolutionModeHandler = ({
  getPersistedFfprobeResolutionMode,
}: GetFfprobeResolutionModeDeps): void => {
  ipcMain.handle('cutrail:get-ffprobe-resolution-mode', async (event) => {
    assertTrustedSender(event);

    return getPersistedFfprobeResolutionMode();
  });
};

export {
  registerGetFfprobeResolutionModeHandler,
};
