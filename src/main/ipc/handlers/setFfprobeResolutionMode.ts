import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { setFfprobeResolutionMode } from '../../../infra/ffmpeg/ffmpegResolutionPreferences.ts';
import type { BinaryResolutionMode } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SetFfprobeResolutionModeDeps = {
  setPersistedFfprobeResolutionMode: (mode: BinaryResolutionMode) => Promise<void>;
};

const normalizeResolutionMode = (value: unknown): BinaryResolutionMode => {
  if (value === 'bundled' || value === 'local') {
    return value;
  }

  return 'auto';
};

const registerSetFfprobeResolutionModeHandler = ({
  setPersistedFfprobeResolutionMode,
}: SetFfprobeResolutionModeDeps): void => {
  ipcMain.handle('cutrail:set-ffprobe-resolution-mode', async (event, payload) => {
    assertTrustedSender(event);

    const nextValue = normalizeResolutionMode(payload);

    setFfprobeResolutionMode(nextValue);
    await setPersistedFfprobeResolutionMode(nextValue);

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:ffprobe-resolution-mode-updated', nextValue);
    }

    return nextValue;
  });
};

export {
  registerSetFfprobeResolutionModeHandler,
};
