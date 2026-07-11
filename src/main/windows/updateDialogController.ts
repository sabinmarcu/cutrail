import type { BrowserWindow } from 'electron';

type UpdateDialogAction = {
  id: string,
  label: string,
  variant?: 'primary' | 'secondary',
};

type UpdateDialogVersionNotes = {
  version: string,
  notes: string,
};

type UpdateDialogState = {
  title: string,
  subtitle?: string,
  message: string,
  detail?: string,
  latestDetail?: string,
  olderVersionDetails?: UpdateDialogVersionNotes[],
  actions: UpdateDialogAction[],
  cancelAction?: string,
  progressPercent?: number,
  progressLabel?: string,
  showProgress?: boolean,
  persistOnActions?: string[],
};

type OpenUpdateDialogOptions = {
  reuseExistingWindow?: boolean,
};

type UpdateDialogControllerDeps = {
  createStandardWindow: (options: {
    height: number,
    minHeight: number,
    minWidth: number,
    mode: string,
    title?: string,
    width: number,
  }) => BrowserWindow,
};

const resolveMode = () => 'updates';

/**
 * @param {UpdateDialogControllerDeps} deps
 * @returns {{
 *   getUpdateDialogState: (
 *     senderWindow: BrowserWindow | null
 *   ) => UpdateDialogState | null,
 *   openUpdateDialog: (
 *     state: UpdateDialogState,
 *     options?: OpenUpdateDialogOptions
 *   ) => Promise<string>,
 *   updateUpdateDialogState: (patch: Partial<UpdateDialogState>) => boolean,
 *   submitUpdateDialogAction: (
 *     senderWindow: BrowserWindow | null,
 *     action: string
 *   ) => boolean
 * }}
 */
const createUpdateDialogController = ({ createStandardWindow }: UpdateDialogControllerDeps) => {
  let updatesWindow: BrowserWindow | null = null;
  let updateDialogState: UpdateDialogState | null = null;
  let pendingResolve: ((action: string) => void) | null = null;

  const notifyState = (): void => {
    if (!updatesWindow || updatesWindow.isDestroyed() || !updateDialogState) {
      return;
    }

    updatesWindow.webContents.send('cutrail:update-dialog-state', updateDialogState);
  };

  const resolvePendingAction = (action: string): void => {
    const resolve = pendingResolve;

    pendingResolve = null;

    if (resolve) {
      resolve(action);
    }
  };

  /**
   * @param {UpdateDialogState} state
   * @param {OpenUpdateDialogOptions} [options]
   */
  const openUpdateDialog = (
    state: UpdateDialogState,
    options: OpenUpdateDialogOptions = {},
  ) => new Promise<string>((resolve) => {
    const shouldReuseExistingWindow = options.reuseExistingWindow === true;

    if (shouldReuseExistingWindow && updatesWindow && !updatesWindow.isDestroyed()) {
      updateDialogState = {
        ...updateDialogState,
        ...state,
      };
      pendingResolve = resolve;
      notifyState();
      updatesWindow.focus();

      return;
    }

    if (updatesWindow && !updatesWindow.isDestroyed()) {
      const previousWindow = updatesWindow;

      updatesWindow = null;
      resolvePendingAction('dismiss');
      updateDialogState = null;
      previousWindow.close();
    }

    updateDialogState = state;
    pendingResolve = resolve;

    const nextWindow = createStandardWindow({
      width: 920,
      height: 700,
      minWidth: 720,
      minHeight: 520,
      mode: resolveMode(),
      title: state.title,
    });

    updatesWindow = nextWindow;

    nextWindow.webContents.once('did-finish-load', () => {
      if (updatesWindow !== nextWindow || nextWindow.isDestroyed()) {
        return;
      }

      notifyState();
    });

    nextWindow.on('closed', () => {
      if (updatesWindow !== nextWindow) {
        return;
      }

      updatesWindow = null;

      if (pendingResolve) {
        resolvePendingAction(updateDialogState?.cancelAction ?? state.cancelAction ?? 'dismiss');
        updateDialogState = null;
      }
    });
  });

  /**
   * @param {Partial<UpdateDialogState>} patch
   * @returns {boolean}
   */
  const updateUpdateDialogState = (patch: Partial<UpdateDialogState>): boolean => {
    if (!updateDialogState) {
      return false;
    }

    updateDialogState = {
      ...updateDialogState,
      ...patch,
    };

    notifyState();

    return true;
  };

  /**
    * @param {BrowserWindow | null} senderWindow
   * @returns {UpdateDialogState | null}
   */
  const getUpdateDialogState = (senderWindow: BrowserWindow | null): UpdateDialogState | null => {
    if (!senderWindow || senderWindow !== updatesWindow) {
      return null;
    }

    return updateDialogState;
  };

  /**
    * @param {BrowserWindow | null} senderWindow
   * @param {string} action
   * @returns {boolean}
   */
  const submitUpdateDialogAction = (
    senderWindow: BrowserWindow | null,
    action: string,
  ): boolean => {
    if (!senderWindow || senderWindow !== updatesWindow) {
      return false;
    }

    if (typeof action !== 'string' || action.length === 0) {
      return false;
    }

    const keepWindowOpen = Array.isArray(updateDialogState?.persistOnActions)
      && updateDialogState.persistOnActions.includes(action);

    if (keepWindowOpen) {
      resolvePendingAction(action);

      return true;
    }

    const targetWindow = updatesWindow;

    updatesWindow = null;
    resolvePendingAction(action);
    updateDialogState = null;

    if (targetWindow && !targetWindow.isDestroyed()) {
      targetWindow.close();
    }

    return true;
  };

  return {
    getUpdateDialogState,
    openUpdateDialog,
    updateUpdateDialogState,
    submitUpdateDialogAction,
  };
};

export {
  createUpdateDialogController,
};
