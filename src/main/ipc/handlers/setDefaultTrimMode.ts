import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SetDefaultTrimModeDeps = {
  setPersistedDefaultTrimMode: (value: 'fast' | 'accurate') => Promise<void>;
};

const registerSetDefaultTrimModeHandler = ({
  setPersistedDefaultTrimMode,
}: SetDefaultTrimModeDeps): void => {
  ipcMain.handle('cutrail:set-default-trim-mode', async (event, payload) => {
    assertTrustedSender(event);
    const nextValue = payload === 'accurate' ? 'accurate' : 'fast';

    await setPersistedDefaultTrimMode(nextValue);

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:default-trim-mode-updated', nextValue);
    }

    return nextValue;
  });
};

export {
  registerSetDefaultTrimModeHandler,
};
