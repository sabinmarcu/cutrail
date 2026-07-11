import {
  Menu,
} from 'electron';
import type { BrowserWindow } from 'electron';
import type { WindowMenuModel } from '../shared/windowMenu.ts';
import {
  buildMenuState,
  type AppMenuDependencies,
  type MenuState,
} from './menuModel.ts';

const EMPTY_MENU_MODEL: WindowMenuModel = { groups: [] };

let currentMenuState: MenuState | null = null;

const createAppMenu = (dependencies: AppMenuDependencies): void => {
  currentMenuState = buildMenuState(dependencies);

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(currentMenuState.nativeTemplate),
  );
};

const getWindowMenuModel = (): WindowMenuModel => {
  if (!currentMenuState) {
    return EMPTY_MENU_MODEL;
  }

  return currentMenuState.rendererModel;
};

const invokeWindowMenuAction = async (
  actionId: string,
  senderWindow: BrowserWindow | null,
): Promise<boolean> => {
  if (!currentMenuState) {
    return false;
  }

  return currentMenuState.runMenuAction(actionId, senderWindow);
};

export {
  createAppMenu,
  getWindowMenuModel,
  invokeWindowMenuAction,
};
