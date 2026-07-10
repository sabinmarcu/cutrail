import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SetHideDefaultAudioTrackWhenMultipleDeps = {
  setPersistedHideDefaultAudioTrackWhenMultiple: (value: boolean) => Promise<void>;
};

const registerSetHideDefaultAudioTrackWhenMultipleHandler = ({
  setPersistedHideDefaultAudioTrackWhenMultiple,
}: SetHideDefaultAudioTrackWhenMultipleDeps): void => {
  ipcMain.handle('cutrail:set-hide-default-audio-track-when-multiple', async (event, payload) => {
    assertTrustedSender(event);
    const nextValue = payload === true;

    await setPersistedHideDefaultAudioTrackWhenMultiple(nextValue);

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:hide-default-audio-track-when-multiple-updated', nextValue);
    }

    return nextValue;
  });
};

export {
  registerSetHideDefaultAudioTrackWhenMultipleHandler,
};
