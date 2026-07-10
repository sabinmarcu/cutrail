import type { BrowserWindowConstructorOptions } from 'electron';

type WindowOptionInput = {
  appIconPath: string;
  height: number;
  minHeight?: number;
  minWidth?: number;
  preloadEntry: string;
  title?: string;
  x: number;
  y: number;
  width: number;
};

const buildWindowOptions = ({
  appIconPath, height, minHeight, minWidth, preloadEntry, title, x, y, width,
}: WindowOptionInput): BrowserWindowConstructorOptions => ({
  center: false,
  width,
  height,
  x,
  y,
  minWidth,
  minHeight,
  title,
  icon: appIconPath,
  frame: false,
  transparent: true,
  backgroundColor: '#00000000',
  autoHideMenuBar: true,
  webPreferences: {
    preload: preloadEntry,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: false,
    webSecurity: true,
  },
});

export {
  buildWindowOptions,
};
