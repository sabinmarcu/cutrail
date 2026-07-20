import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetDefaultTrimModeDeps = {
  getPersistedDefaultTrimMode: () => Promise<'fast' | 'accurate'>;
};

const registerGetDefaultTrimModeHandler = ({
  getPersistedDefaultTrimMode,
}: GetDefaultTrimModeDeps): void => {
  ipcMain.handle('cutrail:get-default-trim-mode', async (event) => {
    assertTrustedSender(event);

    return getPersistedDefaultTrimMode();
  });
};

export {
  registerGetDefaultTrimModeHandler,
};
