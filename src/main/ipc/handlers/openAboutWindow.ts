import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type OpenAboutWindowDeps = {
  openAboutWindow: () => Promise<boolean> | boolean;
};

const registerOpenAboutWindowHandler = ({
  openAboutWindow,
}: OpenAboutWindowDeps): void => {
  ipcMain.handle('cutrail:open-about-window', async (event) => {
    assertTrustedSender(event);

    return openAboutWindow();
  });
};

export {
  registerOpenAboutWindowHandler,
};
