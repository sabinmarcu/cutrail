// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {string} */
const PRELOAD_ENTRY = path.resolve(__dirname, '../preload/preload.mjs');
/** @type {string} */
const RENDERER_ENTRY = path.resolve(__dirname, '../../dist/renderer/index.html');
/** @type {string} */
const ABOUT_ICON_PATH = path.resolve(__dirname, '../assets/logo.svg');
/** @type {string} */
const ICONS_DIR = path.resolve(__dirname, '../assets/icons');
/** @type {string} */
const APP_ICON_PATH = process.platform === 'darwin'
  ? path.join(ICONS_DIR, 'icon.icns')
  : (process.platform === 'win32'
    ? path.join(ICONS_DIR, 'icon.ico')
    : path.join(ICONS_DIR, 'icon.png'));
/** @type {string} */
const PACKAGE_JSON_DIR = path.resolve(__dirname, '../..');

export {
  ABOUT_ICON_PATH,
  APP_ICON_PATH,
  PACKAGE_JSON_DIR,
  PRELOAD_ENTRY,
  RENDERER_ENTRY,
};
