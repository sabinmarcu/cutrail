import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type OpenLicensesWindowDeps = {
  openLicensesWindow: () => boolean;
};

const registerOpenLicensesWindowHandler = ({
  openLicensesWindow,
}: OpenLicensesWindowDeps): void => {
  ipcMain.handle('cutrail:open-licenses-window', async (event) => {
    assertTrustedSender(event);

    return openLicensesWindow();
  });
};

export {
  registerOpenLicensesWindowHandler,
};
