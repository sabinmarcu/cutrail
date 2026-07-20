import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { setFfmpegResolutionMode } from '../../../infra/ffmpeg/ffmpegResolutionPreferences.ts';
import type { BinaryResolutionMode } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SetFfmpegResolutionModeDeps = {
  setPersistedFfmpegResolutionMode: (mode: BinaryResolutionMode) => Promise<void>;
};

const normalizeResolutionMode = (value: unknown): BinaryResolutionMode => {
  if (value === 'bundled' || value === 'local') {
    return value;
  }

  return 'auto';
};

const registerSetFfmpegResolutionModeHandler = ({
  setPersistedFfmpegResolutionMode,
}: SetFfmpegResolutionModeDeps): void => {
  ipcMain.handle('cutrail:set-ffmpeg-resolution-mode', async (event, payload) => {
    assertTrustedSender(event);

    const nextValue = normalizeResolutionMode(payload);

    setFfmpegResolutionMode(nextValue);
    await setPersistedFfmpegResolutionMode(nextValue);

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:ffmpeg-resolution-mode-updated', nextValue);
    }

    return nextValue;
  });
};

export {
  registerSetFfmpegResolutionModeHandler,
};
