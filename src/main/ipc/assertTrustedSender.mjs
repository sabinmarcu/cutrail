// @ts-check

/**
 * @param {import('electron').IpcMainInvokeEvent} event
 * @returns {void}
 */
const assertTrustedSender = (event) => {
  if (event.senderFrame !== event.sender.mainFrame) {
    throw new Error('Untrusted IPC sender frame');
  }
};

export {
  assertTrustedSender,
};
