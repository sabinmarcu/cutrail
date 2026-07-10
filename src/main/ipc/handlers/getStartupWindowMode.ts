import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetStartupWindowModeDeps = {
  getPersistedStartupWindowMode: () => Promise<'splash' | 'library'>;
};

const registerGetStartupWindowModeHandler = ({
  getPersistedStartupWindowMode,
}: GetStartupWindowModeDeps): void => {
  ipcMain.handle('cutrail:get-startup-window-mode', async (event) => {
    assertTrustedSender(event);

    return getPersistedStartupWindowMode();
  });
};

export {
  registerGetStartupWindowModeHandler,
};
