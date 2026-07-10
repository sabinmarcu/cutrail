import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const appRoot = path.resolve(dirname, '../../..');

const PRELOAD_ENTRY = path.resolve(dirname, '../preload/main.js');
const RENDERER_ENTRY = path.resolve(dirname, '../../renderer/index.html');
const ABOUT_ICON_PATH = path.resolve(appRoot, 'src/assets/logo.svg');
const ICONS_DIR = path.resolve(appRoot, 'src/assets/icons');
const APP_ICON_PATH = process.platform === 'darwin'
  ? path.join(ICONS_DIR, 'icon.icns')
  : (process.platform === 'win32'
    ? path.join(ICONS_DIR, 'icon.ico')
    : path.join(ICONS_DIR, 'icon.png'));
const PACKAGE_JSON_DIR = appRoot;

export {
  ABOUT_ICON_PATH,
  APP_ICON_PATH,
  PACKAGE_JSON_DIR,
  PRELOAD_ENTRY,
  RENDERER_ENTRY,
};
