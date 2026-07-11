import { ipcMain } from 'electron';
import type { ThemePrimaryColorValue } from '../../../shared/themePrimaryColor.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type GetThemePrimaryColorDeps = {
  getPersistedThemePrimaryColor: () => Promise<ThemePrimaryColorValue>;
};

const registerGetThemePrimaryColorHandler = ({
  getPersistedThemePrimaryColor,
}: GetThemePrimaryColorDeps): void => {
  ipcMain.handle('cutrail:get-theme-primary-color', async (event) => {
    assertTrustedSender(event);

    return getPersistedThemePrimaryColor();
  });
};

export {
  registerGetThemePrimaryColorHandler,
};
