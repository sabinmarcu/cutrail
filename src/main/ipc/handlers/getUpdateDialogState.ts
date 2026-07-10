import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetUpdateDialogStateDeps = {
  getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown;
};

const registerGetUpdateDialogStateHandler = ({
  getUpdateDialogState,
}: GetUpdateDialogStateDeps): void => {
  ipcMain.handle('cutrail:get-update-dialog-state', async (event) => {
    assertTrustedSender(event);

    return getUpdateDialogState(BrowserWindow.fromWebContents(event.sender));
  });
};

export {
  registerGetUpdateDialogStateHandler,
};
