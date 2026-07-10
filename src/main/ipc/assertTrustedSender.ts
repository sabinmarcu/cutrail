import type { IpcMainInvokeEvent } from 'electron';

const assertTrustedSender = (event: IpcMainInvokeEvent): void => {
  if (event.senderFrame !== event.sender.mainFrame) {
    throw new Error('Untrusted IPC sender frame');
  }
};

export {
  assertTrustedSender,
};
