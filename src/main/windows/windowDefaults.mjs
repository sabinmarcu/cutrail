// @ts-check

/**
 * @typedef {{
 *   appIconPath: string,
 *   height: number,
 *   minHeight?: number,
 *   minWidth?: number,
 *   preloadEntry: string,
 *   title?: string,
 *   x: number,
 *   y: number,
 *   width: number
 * }} WindowOptionInput
 */

/**
 * @param {WindowOptionInput} options
 * @returns {import('electron').BrowserWindowConstructorOptions}
 */
const buildWindowOptions = ({
  appIconPath, height, minHeight, minWidth, preloadEntry, title, x, y, width,
}) => ({
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
