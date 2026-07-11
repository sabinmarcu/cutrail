import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import type { WindowDecorationMenuPreferenceState } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SetWindowDecorationMenuPreferenceDeps = {
  setWindowDecorationMenuPreference: (
    enabled: boolean,
  ) => Promise<WindowDecorationMenuPreferenceState>;
};

const registerSetWindowDecorationMenuPreferenceHandler = ({
  setWindowDecorationMenuPreference,
}: SetWindowDecorationMenuPreferenceDeps): void => {
  ipcMain.handle('cutrail:set-window-decoration-menu-preference', async (event, payload) => {
    assertTrustedSender(event);

    const preference = await setWindowDecorationMenuPreference(payload === true);

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:window-decoration-menu-preference-updated', preference);
    }

    return preference;
  });
};

export {
  registerSetWindowDecorationMenuPreferenceHandler,
};
