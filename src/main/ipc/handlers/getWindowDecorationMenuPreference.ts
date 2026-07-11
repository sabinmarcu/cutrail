import { ipcMain } from 'electron';
import type { WindowDecorationMenuPreferenceState } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetWindowDecorationMenuPreferenceDeps = {
  getWindowDecorationMenuPreference: () => Promise<WindowDecorationMenuPreferenceState>;
};

const registerGetWindowDecorationMenuPreferenceHandler = ({
  getWindowDecorationMenuPreference,
}: GetWindowDecorationMenuPreferenceDeps): void => {
  ipcMain.handle('cutrail:get-window-decoration-menu-preference', async (event) => {
    assertTrustedSender(event);

    return getWindowDecorationMenuPreference();
  });
};

export {
  registerGetWindowDecorationMenuPreferenceHandler,
};
