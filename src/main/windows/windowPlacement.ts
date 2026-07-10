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

const getWindowPlacement = (
  { width, height }: { width: number; height: number },
): { x: number; y: number } => {
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
