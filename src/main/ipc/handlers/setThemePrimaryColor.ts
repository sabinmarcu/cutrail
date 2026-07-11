import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import {
  defaultThemePrimaryColor,
  isThemePrimaryColorValue,
  normalizeThemePrimaryColor,
  type ThemePrimaryColorValue,
} from '../../../shared/themePrimaryColor.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SetThemePrimaryColorDeps = {
  setPersistedThemePrimaryColor: (value: ThemePrimaryColorValue) => Promise<void>;
};

const registerSetThemePrimaryColorHandler = ({
  setPersistedThemePrimaryColor,
}: SetThemePrimaryColorDeps): void => {
  ipcMain.handle('cutrail:set-theme-primary-color', async (event, payload) => {
    assertTrustedSender(event);
    const nextValue = isThemePrimaryColorValue(payload)
      ? normalizeThemePrimaryColor(payload)
      : defaultThemePrimaryColor;

    await setPersistedThemePrimaryColor(nextValue);

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:theme-primary-color-updated', nextValue);
    }

    return nextValue;
  });
};

export {
  registerSetThemePrimaryColorHandler,
};
