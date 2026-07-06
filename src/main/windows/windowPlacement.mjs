// @ts-check

import {
  BrowserWindow,
  screen,
} from 'electron';

/**
 * @returns {import('electron').Display}
 */
const resolveTargetDisplay = () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  if (focusedWindow && !focusedWindow.isDestroyed()) {
    return screen.getDisplayMatching(focusedWindow.getBounds());
  }

  return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
};

/**
 * @param {{ width: number, height: number }} size
 * @returns {{ x: number, y: number }}
 */
const getWindowPlacement = ({ width, height }) => {
  const display = resolveTargetDisplay();
  const targetBounds = display.workArea;
  const centeredX = targetBounds.x + ((targetBounds.width - width) / 2);
  const centeredY = targetBounds.y + ((targetBounds.height - height) / 2);

  return {
    x: Math.round(centeredX),
    y: Math.round(centeredY),
  };
};

export {
  getWindowPlacement,
};
