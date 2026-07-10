import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetSourceDirectoryDeps = {
  getPersistedSourceDirectory: () => Promise<string | null>;
};

const registerGetSourceDirectoryHandler = ({
  getPersistedSourceDirectory,
}: GetSourceDirectoryDeps): void => {
  ipcMain.handle('cutrail:get-source-directory', async (event) => {
    assertTrustedSender(event);

    return getPersistedSourceDirectory();
  });
};

export {
  registerGetSourceDirectoryHandler,
};
