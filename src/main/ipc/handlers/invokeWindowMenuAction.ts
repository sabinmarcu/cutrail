import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type InvokeWindowMenuActionDeps = {
  invokeWindowMenuAction: (
    actionId: string,
    senderWindow: BrowserWindow | null,
  ) => Promise<boolean>;
};

const registerInvokeWindowMenuActionHandler = ({
  invokeWindowMenuAction,
}: InvokeWindowMenuActionDeps): void => {
  ipcMain.handle('cutrail:invoke-window-menu-action', async (event, actionId) => {
    assertTrustedSender(event);

    if (typeof actionId !== 'string' || actionId.length === 0) {
      throw new TypeError('actionId must be a non-empty string');
    }

    const senderWindow = BrowserWindow.fromWebContents(event.sender);

    return invokeWindowMenuAction(actionId, senderWindow);
  });
};

export {
  registerInvokeWindowMenuActionHandler,
};
