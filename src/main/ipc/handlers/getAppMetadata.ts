import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetAppMetadataDeps = {
  getAppMetadata: () => Promise<{
    version: string;
    copyright: string;
    attribution: string;
    license: string;
  }>;
};

const registerGetAppMetadataHandler = ({ getAppMetadata }: GetAppMetadataDeps): void => {
  ipcMain.handle('cutrail:get-app-metadata', async (event) => {
    assertTrustedSender(event);

    return getAppMetadata();
  });
};

export {
  registerGetAppMetadataHandler,
};
