// @ts-check

/**
 * @param {string} mode
 * @param {string} sourcePath
 * @returns {string}
 */
const buildRendererSearch = (mode, sourcePath) => {
  const search = new URLSearchParams();

  if (mode !== 'app') {
    search.set('mode', mode);
  }

  if (typeof sourcePath === 'string' && sourcePath.length > 0) {
    search.set('source', sourcePath);
  }

  return search.toString();
};

/**
 * @param {{
 *   devServerUrl?: string,
 *   rendererEntry: string,
 *   window: import('electron').BrowserWindow,
 *   mode?: string,
 *   sourcePath?: string
 * }} options
 * @returns {void}
 */
const loadRendererWindow = ({
  devServerUrl,
  rendererEntry,
  window,
  mode = 'app',
  sourcePath = '',
}) => {
  const search = buildRendererSearch(mode, sourcePath);

  if (devServerUrl) {
    const target = search.length > 0 ? `${devServerUrl}?${search}` : devServerUrl;
    void window.loadURL(target);

    return;
  }

  void window.loadFile(rendererEntry, search.length > 0 ? { search } : undefined);
};

export {
  loadRendererWindow,
};
