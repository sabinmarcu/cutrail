import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type OpenLibraryWindowDeps = {
  openLibraryWindow: () => boolean;
};

const registerOpenLibraryWindowHandler = ({
  openLibraryWindow,
}: OpenLibraryWindowDeps): void => {
  ipcMain.handle('cutrail:open-library-window', async (event) => {
    assertTrustedSender(event);

    return openLibraryWindow();
  });
};

export {
  registerOpenLibraryWindowHandler,
};
