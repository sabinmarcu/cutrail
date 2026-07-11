import type { BrowserWindowConstructorOptions } from 'electron';

type WindowOptionInput = {
  appIconPath: string;
  forceNativeWindowDecorations: boolean;
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
  appIconPath,
  forceNativeWindowDecorations,
  height,
  minHeight,
  minWidth,
  preloadEntry,
  title,
  x,
  y,
  width,
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
  frame: forceNativeWindowDecorations,
  transparent: !forceNativeWindowDecorations,
  backgroundColor: forceNativeWindowDecorations ? '#111111' : '#00000000',
  autoHideMenuBar: process.platform !== 'win32',
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
