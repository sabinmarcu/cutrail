import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type OpenOptionsWindowDeps = {
  openOptionsWindow: () => boolean;
};

const registerOpenOptionsWindowHandler = ({
  openOptionsWindow,
}: OpenOptionsWindowDeps): void => {
  ipcMain.handle('cutrail:open-options-window', async (event) => {
    assertTrustedSender(event);

    return openOptionsWindow();
  });
};

export {
  registerOpenOptionsWindowHandler,
};
