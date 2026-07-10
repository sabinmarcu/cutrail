import {
  BrowserWindow,
  Menu,
  app,
} from 'electron';
import type { MenuItemConstructorOptions } from 'electron';

type AppMenuDependencies = {
  checkForUpdates: () => Promise<boolean>;
  installStandaloneAppImage: () => Promise<void>;
  uninstallStandaloneAppImage: () => Promise<void>;
  standaloneAction: 'install' | 'uninstall' | null;
  isUpdateCheckEnabled: boolean;
  updateCheckLabel: string;
  openAboutWindow: () => Promise<boolean> | boolean;
  openDiagnosticsWindow: () => boolean;
  openEditorWindow: (sourcePath: string) => boolean;
  openLibraryWindow: () => boolean;
  openLicensesWindow: () => boolean;
  openOptionsWindow: () => boolean;
  selectSourceVideo: () => Promise<string | null>;
};

const createAppMenu = ({
  checkForUpdates,
  installStandaloneAppImage,
  uninstallStandaloneAppImage,
  standaloneAction,
  isUpdateCheckEnabled,
  openAboutWindow,
  openDiagnosticsWindow,
  openEditorWindow,
  openLibraryWindow,
  openLicensesWindow,
  openOptionsWindow,
  selectSourceVideo,
  updateCheckLabel,
}: AppMenuDependencies): void => {
  const isMac = process.platform === 'darwin';
  const openVideoFromDialog = async () => {
    const sourcePath = await selectSourceVideo();

    if (sourcePath) {
      openEditorWindow(sourcePath);
    }
  };
  const sharedFileActions = [
    {
      label: 'Open Video...',
      accelerator: 'CmdOrCtrl+O',
      click: () => { openVideoFromDialog(); },
    },
    {
      label: 'Open Library',
      accelerator: 'CmdOrCtrl+Shift+L',
      click: () => { openLibraryWindow(); },
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
  ];

  const template = [
    ...(isMac
      ? [{
        label: app.name,
        submenu: [
          {
            label: 'About Cutrail',
            click: () => { openAboutWindow(); },
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
              click: () => { openAboutWindow(); },
            },
            {
              label: 'Licenses & Notices',
              click: () => { openLicensesWindow(); },
            },
            { type: 'separator' },
          ]
          : []),
        ...sharedFileActions,
        ...(isMac
          ? [
            {
              label: 'Licenses & Notices',
              click: () => { openLicensesWindow(); },
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
        ...(standaloneAction === 'install'
          ? [
            {
              label: 'Install Standalone Shortcut (Linux AppImage)...',
              click: () => { installStandaloneAppImage(); },
            },
            { type: 'separator' },
          ]
          : (standaloneAction === 'uninstall'
            ? [
              {
                label: 'Uninstall Standalone Shortcut (Linux AppImage)...',
                click: () => { uninstallStandaloneAppImage(); },
              },
              { type: 'separator' },
            ]
            : [])
        ),
        {
          label: updateCheckLabel,
          enabled: isUpdateCheckEnabled,
          click: () => { checkForUpdates(); },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(template as unknown as MenuItemConstructorOptions[]),
  );
};

export {
  createAppMenu,
};
