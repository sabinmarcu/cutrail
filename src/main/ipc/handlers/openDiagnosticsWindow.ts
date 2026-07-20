import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type OpenDiagnosticsWindowDeps = {
  openDiagnosticsWindow: () => boolean;
};

const registerOpenDiagnosticsWindowHandler = ({
  openDiagnosticsWindow,
}: OpenDiagnosticsWindowDeps): void => {
  ipcMain.handle('cutrail:open-diagnostics-window', async (event) => {
    assertTrustedSender(event);

    return openDiagnosticsWindow();
  });
};

export {
  registerOpenDiagnosticsWindowHandler,
};