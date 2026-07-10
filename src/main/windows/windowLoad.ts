import type { BrowserWindow } from 'electron';

const buildRendererSearch = (mode: string, sourcePath: string): string => {
  const search = new URLSearchParams();

  if (mode !== 'app') {
    search.set('mode', mode);
  }

  if (typeof sourcePath === 'string' && sourcePath.length > 0) {
    search.set('source', sourcePath);
  }

  return search.toString();
};

type LoadRendererWindowOptions = {
  devServerUrl?: string;
  rendererEntry: string;
  window: BrowserWindow;
  mode?: string;
  sourcePath?: string;
};

const loadRendererWindow = ({
  devServerUrl,
  rendererEntry,
  window,
  mode = 'app',
  sourcePath = '',
}: LoadRendererWindowOptions): void => {
  const search = buildRendererSearch(mode, sourcePath);

  if (devServerUrl) {
    const target = search.length > 0 ? `${devServerUrl}?${search}` : devServerUrl;
    window.loadURL(target);

    return;
  }

  window.loadFile(rendererEntry, search.length > 0 ? { search } : undefined);
};

export {
  loadRendererWindow,
};
