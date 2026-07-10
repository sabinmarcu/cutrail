import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetHideDefaultAudioTrackWhenMultipleDeps = {
  getPersistedHideDefaultAudioTrackWhenMultiple: () => Promise<boolean>;
};

const registerGetHideDefaultAudioTrackWhenMultipleHandler = ({
  getPersistedHideDefaultAudioTrackWhenMultiple,
}: GetHideDefaultAudioTrackWhenMultipleDeps): void => {
  ipcMain.handle('cutrail:get-hide-default-audio-track-when-multiple', async (event) => {
    assertTrustedSender(event);

    return getPersistedHideDefaultAudioTrackWhenMultiple();
  });
};

export {
  registerGetHideDefaultAudioTrackWhenMultipleHandler,
};
