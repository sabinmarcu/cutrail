import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SetStartupWindowModeDeps = {
  setPersistedStartupWindowMode: (startupWindowMode: 'splash' | 'library') => Promise<void>;
};

const registerSetStartupWindowModeHandler = ({
  setPersistedStartupWindowMode,
}: SetStartupWindowModeDeps): void => {
  ipcMain.handle('cutrail:set-startup-window-mode', async (event, payload) => {
    assertTrustedSender(event);
    const startupWindowMode = payload === 'library' ? 'library' : 'splash';

    await setPersistedStartupWindowMode(startupWindowMode);

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:startup-window-mode-updated', startupWindowMode);
    }

    return startupWindowMode;
  });
};

export {
  registerSetStartupWindowModeHandler,
};
