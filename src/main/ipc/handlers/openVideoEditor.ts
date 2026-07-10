import {
  BrowserWindow,
  dialog,
  ipcMain,
} from 'electron';
import type { OpenVideoEditorPayload } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { validateSourceVideoFile } from '../../sourceSelection.ts';

type OpenVideoEditorDeps = {
  openEditorWindow: (sourcePath: string) => boolean;
  selectValidSourceVideo: (parentWindow: BrowserWindow | null) => Promise<string | null>;
};

const registerOpenVideoEditorHandler = ({
  openEditorWindow,
  selectValidSourceVideo,
}: OpenVideoEditorDeps): void => {
  ipcMain.handle('cutrail:open-video-editor', async (event, payload) => {
    assertTrustedSender(event);
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const nextPayload: OpenVideoEditorPayload = typeof payload === 'object' && payload !== null
      ? payload as OpenVideoEditorPayload
      : {};
    const payloadSourcePath = typeof nextPayload.sourcePath === 'string' ? nextPayload.sourcePath.trim() : '';

    if (payloadSourcePath.length > 0) {
      const validation = await validateSourceVideoFile(payloadSourcePath);

      if (validation.valid === false) {
        const messageOptions = {
          type: 'error',
          title: 'Invalid Source Video',
          message: 'The dropped source video cannot be loaded.',
          detail: `${validation.message}\n\nPath: ${payloadSourcePath}`,
        } as const;

        await (parentWindow
          ? dialog.showMessageBox(parentWindow, messageOptions)
          : dialog.showMessageBox(messageOptions));

        return null;
      }

      openEditorWindow(payloadSourcePath);

      return payloadSourcePath;
    }

    const selectedPath = await selectValidSourceVideo(parentWindow);

    if (!selectedPath) {
      return null;
    }

    openEditorWindow(selectedPath);

    return selectedPath;
  });
};

export {
  registerOpenVideoEditorHandler,
};
