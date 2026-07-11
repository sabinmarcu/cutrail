import {
  BrowserWindow,
  app,
} from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import type {
  WindowMenuModel,
  WindowMenuSeparatorItem,
} from '../shared/windowMenu.ts';

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

type MenuState = {
  nativeTemplate: MenuItemConstructorOptions[];
  rendererModel: WindowMenuModel;
  runMenuAction: (
    actionId: string,
    senderWindow: BrowserWindow | null,
  ) => Promise<boolean>;
};

type MenuActionEntry = {
  enabled: boolean;
  run: (senderWindow: BrowserWindow | null) => Promise<void>;
};

type NullableWindow = BrowserWindow | null;

const getTargetWindow = (
  senderWindow: NullableWindow,
): NullableWindow => senderWindow ?? BrowserWindow.getFocusedWindow() ?? null;

function getTargetWebContents(senderWindow: NullableWindow) {
  return getTargetWindow(senderWindow)?.webContents ?? null;
}

const separatorItem = (id: string): WindowMenuSeparatorItem => ({
  type: 'separator',
  id,
});

const buildMenuState = (deps: AppMenuDependencies): MenuState => {
  const isMac = process.platform === 'darwin';

  const actions: Record<string, MenuActionEntry> = {
    'file.open-video': {
      enabled: true,
      run: async () => {
        const sourcePath = await deps.selectSourceVideo();

        if (sourcePath) {
          deps.openEditorWindow(sourcePath);
        }
      },
    },
    'file.open-library': {
      enabled: true,
      run: async () => {
        deps.openLibraryWindow();
      },
    },
    'file.open-options': {
      enabled: true,
      run: async () => {
        deps.openOptionsWindow();
      },
    },
    'file.about': {
      enabled: true,
      run: async () => {
        await deps.openAboutWindow();
      },
    },
    'file.licenses': {
      enabled: true,
      run: async () => {
        deps.openLicensesWindow();
      },
    },
    'window.close': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWindow(senderWindow)?.close();
      },
    },
    'app.quit': {
      enabled: true,
      run: async () => {
        app.quit();
      },
    },
    'development.diagnostics': {
      enabled: true,
      run: async () => {
        deps.openDiagnosticsWindow();
      },
    },
    'development.toggle-devtools': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.toggleDevTools();
      },
    },
    'edit.undo': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.undo();
      },
    },
    'edit.redo': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.redo();
      },
    },
    'edit.cut': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.cut();
      },
    },
    'edit.copy': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.copy();
      },
    },
    'edit.paste': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.paste();
      },
    },
    'edit.paste-match-style': {
      enabled: isMac,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.pasteAndMatchStyle();
      },
    },
    'edit.delete': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.delete();
      },
    },
    'edit.select-all': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.selectAll();
      },
    },
    'view.reload': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.reload();
      },
    },
    'view.force-reload': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.reloadIgnoringCache();
      },
    },
    'view.reset-zoom': {
      enabled: true,
      run: async (senderWindow) => {
        getTargetWebContents(senderWindow)?.setZoomLevel(0);
      },
    },
    'view.zoom-in': {
      enabled: true,
      run: async (senderWindow) => {
        const contents = getTargetWebContents(senderWindow);

        if (contents) {
          contents.setZoomLevel(contents.getZoomLevel() + 0.5);
        }
      },
    },
    'view.zoom-out': {
      enabled: true,
      run: async (senderWindow) => {
        const contents = getTargetWebContents(senderWindow);

        if (contents) {
          contents.setZoomLevel(contents.getZoomLevel() - 0.5);
        }
      },
    },
    'view.toggle-fullscreen': {
      enabled: true,
      run: async (senderWindow) => {
        const targetWindow = getTargetWindow(senderWindow);

        if (targetWindow) {
          targetWindow.setFullScreen(!targetWindow.isFullScreen());
        }
      },
    },
    'help.install-standalone': {
      enabled: deps.standaloneAction === 'install',
      run: async () => {
        await deps.installStandaloneAppImage();
      },
    },
    'help.uninstall-standalone': {
      enabled: deps.standaloneAction === 'uninstall',
      run: async () => {
        await deps.uninstallStandaloneAppImage();
      },
    },
    'help.check-updates': {
      enabled: deps.isUpdateCheckEnabled,
      run: async () => {
        await deps.checkForUpdates();
      },
    },
  };

  const actionItem = (
    id: string,
    label: string,
    actionId: string,
    accelerator?: string,
  ) => ({
    type: 'action' as const,
    id,
    label,
    actionId,
    accelerator,
    enabled: actions[actionId]?.enabled ?? false,
  });

  const rendererModel: WindowMenuModel = {
    groups: [
      {
        id: 'file',
        label: 'File',
        items: [
          ...(isMac
            ? []
            : [
              actionItem('file.about', 'About Cutrail', 'file.about'),
              actionItem('file.licenses', 'Licenses & Notices', 'file.licenses'),
              separatorItem('file.sep.about'),
            ]),
          actionItem('file.open-video', 'Open Video...', 'file.open-video', 'CmdOrCtrl+O'),
          actionItem('file.open-library', 'Open Library', 'file.open-library', 'CmdOrCtrl+Shift+L'),
          actionItem('file.open-options', 'Options', 'file.open-options', 'CmdOrCtrl+,'),
          actionItem('file.close-window', isMac ? 'Close Window' : 'Quit', isMac ? 'window.close' : 'app.quit', isMac ? 'CmdOrCtrl+W' : undefined),
        ],
      },
      {
        id: 'development',
        label: 'Development',
        items: [
          actionItem('development.diagnostics', 'Diagnostics', 'development.diagnostics'),
          separatorItem('development.sep.1'),
          actionItem(
            'development.toggle-devtools',
            'Toggle DevTools',
            'development.toggle-devtools',
            'CmdOrCtrl+Shift+I',
          ),
        ],
      },
      {
        id: 'edit',
        label: 'Edit',
        items: [
          actionItem('edit.undo', 'Undo', 'edit.undo', 'CmdOrCtrl+Z'),
          actionItem('edit.redo', 'Redo', 'edit.redo', 'CmdOrCtrl+Shift+Z'),
          separatorItem('edit.sep.1'),
          actionItem('edit.cut', 'Cut', 'edit.cut', 'CmdOrCtrl+X'),
          actionItem('edit.copy', 'Copy', 'edit.copy', 'CmdOrCtrl+C'),
          actionItem('edit.paste', 'Paste', 'edit.paste', 'CmdOrCtrl+V'),
          ...(isMac
            ? [
              actionItem(
                'edit.paste-match-style',
                'Paste and Match Style',
                'edit.paste-match-style',
                'CmdOrCtrl+Shift+V',
              ),
            ]
            : []),
          actionItem('edit.delete', 'Delete', 'edit.delete'),
          ...(!isMac ? [separatorItem('edit.sep.2')] : []),
          actionItem('edit.select-all', 'Select All', 'edit.select-all', 'CmdOrCtrl+A'),
        ],
      },
      {
        id: 'view',
        label: 'View',
        items: [
          actionItem('view.reload', 'Reload', 'view.reload', 'CmdOrCtrl+R'),
          actionItem('view.force-reload', 'Force Reload', 'view.force-reload', 'CmdOrCtrl+Shift+R'),
          separatorItem('view.sep.1'),
          actionItem('view.reset-zoom', 'Actual Size', 'view.reset-zoom', 'CmdOrCtrl+0'),
          actionItem('view.zoom-in', 'Zoom In', 'view.zoom-in', 'CmdOrCtrl+='),
          actionItem('view.zoom-out', 'Zoom Out', 'view.zoom-out', 'CmdOrCtrl+-'),
          separatorItem('view.sep.2'),
          actionItem('view.toggle-fullscreen', 'Toggle Fullscreen', 'view.toggle-fullscreen', 'F11'),
        ],
      },
      {
        id: 'help',
        label: 'Help',
        items: [
          ...(deps.standaloneAction === 'install'
            ? [
              actionItem('help.install-standalone', 'Install Standalone Shortcut (Linux AppImage)...', 'help.install-standalone'),
              separatorItem('help.sep.1'),
            ]
            : (deps.standaloneAction === 'uninstall'
              ? [
                actionItem('help.uninstall-standalone', 'Uninstall Standalone Shortcut (Linux AppImage)...', 'help.uninstall-standalone'),
                separatorItem('help.sep.1'),
              ]
              : [])),
          actionItem('help.check-updates', deps.updateCheckLabel, 'help.check-updates'),
        ],
      },
    ],
  };

  const nativeTemplate: MenuItemConstructorOptions[] = rendererModel.groups.map((group) => ({
    label: group.label,
    submenu: group.items.map((item) => {
      if (item.type === 'separator') {
        return { type: 'separator' as const };
      }

      return {
        id: item.id,
        label: item.label,
        enabled: item.enabled,
        accelerator: item.accelerator,
        click: async () => {
          await actions[item.actionId]?.run(BrowserWindow.getFocusedWindow());
        },
      };
    }),
  }));

  const runMenuAction = async (
    actionId: string,
    senderWindow: BrowserWindow | null,
  ): Promise<boolean> => {
    const entry = actions[actionId];

    if (!entry || !entry.enabled) {
      return false;
    }

    await entry.run(senderWindow);

    return true;
  };

  return {
    nativeTemplate,
    rendererModel,
    runMenuAction,
  };
};

export type {
  AppMenuDependencies,
  MenuState,
};

export {
  buildMenuState,
};
