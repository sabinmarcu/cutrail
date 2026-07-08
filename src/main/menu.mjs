// @ts-check

import {
  BrowserWindow,
  Menu,
  app,
} from 'electron';

/**
 * @typedef {{
 *   checkForUpdates: () => Promise<boolean>,
 *   isUpdateCheckEnabled: boolean,
 *   updateCheckLabel: string,
 *   openAboutWindow: () => Promise<boolean> | boolean,
 *   openDiagnosticsWindow: () => boolean,
 *   openEditorWindow: (sourcePath: string) => boolean,
 *   openLicensesWindow: () => boolean,
 *   openOptionsWindow: () => boolean,
 *   selectSourceVideo: () => Promise<string | null>
 * }} AppMenuDependencies
 */

/**
 * @param {AppMenuDependencies} deps
 * @returns {void}
 */
const createAppMenu = ({
  checkForUpdates,
  isUpdateCheckEnabled,
  openAboutWindow,
  openDiagnosticsWindow,
  openEditorWindow,
  openLicensesWindow,
  openOptionsWindow,
  selectSourceVideo,
  updateCheckLabel,
}) => {
  const isMac = process.platform === 'darwin';
  const openVideoFromDialog = async () => {
    const sourcePath = await selectSourceVideo();

    if (sourcePath) {
      openEditorWindow(sourcePath);
    }
  };

  const template = [
    ...(isMac
      ? [{
        label: app.name,
        submenu: [
          {
            label: 'About Cutrail',
            click: () => { void openAboutWindow(); },
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      }]
      : []),
    {
      label: 'File',
      submenu: [
        ...(!isMac
          ? [
            {
              label: 'About Cutrail',
              click: () => { void openAboutWindow(); },
            },
            {
              label: 'Licenses & Notices',
              click: () => { openLicensesWindow(); },
            },
            { type: 'separator' },
          ]
          : []),
        ...(isMac
          ? [
            {
              label: 'Open Video...',
              accelerator: 'CmdOrCtrl+O',
              click: () => { void openVideoFromDialog(); },
            },
            {
              label: 'Options',
              accelerator: 'CmdOrCtrl+,',
              click: () => { openOptionsWindow(); },
            },
            {
              label: 'Close Window',
              accelerator: 'CmdOrCtrl+W',
              click: () => { BrowserWindow.getFocusedWindow()?.close(); },
            },
            { type: 'separator' },
            {
              label: 'Licenses & Notices',
              click: () => { openLicensesWindow(); },
            },
            { type: 'separator' },
          ]
          : []),
        ...(!isMac
          ? [
            {
              label: 'Open Video...',
              accelerator: 'CmdOrCtrl+O',
              click: () => { void openVideoFromDialog(); },
            },
            {
              label: 'Options',
              accelerator: 'CmdOrCtrl+,',
              click: () => { openOptionsWindow(); },
            },
            {
              label: 'Close Window',
              accelerator: 'CmdOrCtrl+W',
              click: () => { BrowserWindow.getFocusedWindow()?.close(); },
            },
            { type: 'separator' },
          ]
          : []),
        { role: isMac ? 'close' : 'quit' },
      ],
    },
    {
      label: 'Development',
      submenu: [
        {
          label: 'Diagnostics',
          click: () => { openDiagnosticsWindow(); },
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
          ]
          : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' },
          ]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: updateCheckLabel,
          enabled: isUpdateCheckEnabled,
          click: () => { void checkForUpdates(); },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(/** @type {import('electron').MenuItemConstructorOptions[]} */ (template)));
};

export {
  createAppMenu,
};
