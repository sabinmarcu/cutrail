// @ts-check

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   variant?: 'primary' | 'secondary'
 * }} UpdateDialogAction
 */

/**
 * @typedef {{
 *   title: string,
 *   subtitle?: string,
 *   message: string,
 *   detail?: string,
 *   actions: UpdateDialogAction[],
 *   cancelAction?: string,
 *   progressPercent?: number,
 *   progressLabel?: string,
 *   showProgress?: boolean,
 *   persistOnActions?: string[]
 * }} UpdateDialogState
 */

/**
 * @typedef {{
 *   reuseExistingWindow?: boolean
 * }} OpenUpdateDialogOptions
 */

/**
 * @typedef {{
 *   createStandardWindow: (options: {
 *     height: number,
 *     minHeight: number,
 *     minWidth: number,
 *     mode: string,
 *     title: string,
 *     width: number
 *   }) => import('electron').BrowserWindow
 * }} UpdateDialogControllerDeps
 */

/**
 * @param {UpdateDialogControllerDeps} deps
 * @returns {{
 *   getUpdateDialogState: (senderWindow: import('electron').BrowserWindow | null) => UpdateDialogState | null,
 *   openUpdateDialog: (state: UpdateDialogState, options?: OpenUpdateDialogOptions) => Promise<string>,
 *   updateUpdateDialogState: (patch: Partial<UpdateDialogState>) => boolean,
 *   submitUpdateDialogAction: (senderWindow: import('electron').BrowserWindow | null, action: string) => boolean
 * }}
 */
const createUpdateDialogController = ({ createStandardWindow }) => {
  /** @type {import('electron').BrowserWindow | null} */
  let updatesWindow = null;
  /** @type {UpdateDialogState | null} */
  let updateDialogState = null;
  /** @type {((action: string) => void) | null} */
  let pendingResolve = null;

  const resolveMode = () => 'updates';

  /** @returns {void} */
  const notifyState = () => {
    if (!updatesWindow || updatesWindow.isDestroyed() || !updateDialogState) {
      return;
    }

    updatesWindow.webContents.send('cutrail:update-dialog-state', updateDialogState);
  };

  /** @param {string} action */
  const resolvePendingAction = (action) => {
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
  const openUpdateDialog = (state, options = {}) => new Promise((resolve) => {
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
  const updateUpdateDialogState = (patch) => {
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
   * @param {import('electron').BrowserWindow | null} senderWindow
   * @returns {UpdateDialogState | null}
   */
  const getUpdateDialogState = (senderWindow) => {
    if (!senderWindow || senderWindow !== updatesWindow) {
      return null;
    }

    return updateDialogState;
  };

  /**
   * @param {import('electron').BrowserWindow | null} senderWindow
   * @param {string} action
   * @returns {boolean}
   */
  const submitUpdateDialogAction = (senderWindow, action) => {
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
