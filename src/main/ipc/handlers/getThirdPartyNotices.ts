import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetThirdPartyNoticesDeps = {
  readThirdPartyNotices: () => Promise<string>;
};

const registerGetThirdPartyNoticesHandler = ({
  readThirdPartyNotices,
}: GetThirdPartyNoticesDeps): void => {
  ipcMain.handle('cutrail:get-third-party-notices', async (event) => {
    assertTrustedSender(event);

    return readThirdPartyNotices();
  });
};

export {
  registerGetThirdPartyNoticesHandler,
};
