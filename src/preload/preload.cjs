const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('cutrail', {
  getRuntimeInfo: () => ({
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  }),
});
