import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetOutputDirectoryDeps = {
  getPersistedOutputDirectory: () => Promise<string | null>;
};

const registerGetOutputDirectoryHandler = ({
  getPersistedOutputDirectory,
}: GetOutputDirectoryDeps): void => {
  ipcMain.handle('cutrail:get-output-directory', async (event) => {
    assertTrustedSender(event);

    return getPersistedOutputDirectory();
  });
};

export {
  registerGetOutputDirectoryHandler,
};
