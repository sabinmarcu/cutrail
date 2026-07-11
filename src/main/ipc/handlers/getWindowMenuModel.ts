import { ipcMain } from 'electron';
import type { WindowMenuModel } from '../../../shared/windowMenu.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetWindowMenuModelDeps = {
  getWindowMenuModel: () => WindowMenuModel;
};

const registerGetWindowMenuModelHandler = ({
  getWindowMenuModel,
}: GetWindowMenuModelDeps): void => {
  ipcMain.handle('cutrail:get-window-menu-model', async (event) => {
    assertTrustedSender(event);

    return getWindowMenuModel();
  });
};

export {
  registerGetWindowMenuModelHandler,
};
