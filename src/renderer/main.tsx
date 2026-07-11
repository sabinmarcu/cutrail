import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';
import { AppWindow } from '@renderer/windows/app/AppWindow';
import { AboutWindow } from '@renderer/windows/about/AboutWindow';
import { DiagnosticsWindow } from '@renderer/windows/diagnostics/DiagnosticsWindow';
import { EditorWindow } from '@renderer/windows/editor/EditorWindow';
import { LibraryWindow } from '@renderer/windows/library/LibraryWindow';
import { LicensesWindow } from '@renderer/windows/licenses/LicensesWindow';
import { OptionsWindow } from '@renderer/windows/options/OptionsWindow';
import { UpdatesWindow } from '@renderer/windows/updates/UpdatesWindow';
import {
  defaultThemePrimaryColor,
  isThemePrimaryColorValue,
} from '../shared/themePrimaryColor';
import { applyRendererTheme } from './theme.setup';

const getRendererMode = () => {
  const search = new URLSearchParams(globalThis.location.search);

  return search.get('mode') ?? 'app';
};

const getRendererApp = () => {
  const mode = getRendererMode();

  if (mode === 'diagnostics') {
    return <DiagnosticsWindow />;
  }

  if (mode === 'about') {
    return <AboutWindow />;
  }

  if (mode === 'editor') {
    return <EditorWindow />;
  }

  if (mode === 'library') {
    return <LibraryWindow />;
  }

  if (mode === 'licenses') {
    return <LicensesWindow />;
  }

  if (mode === 'options') {
    return <OptionsWindow />;
  }

  if (mode === 'updates') {
    return <UpdatesWindow />;
  }

  return <AppWindow />;
};

const rootContainer = document.querySelector('#root');

if (!(rootContainer instanceof HTMLElement)) {
  throw new TypeError('Renderer root element #root was not found.');
}

const resolveThemePrimaryColor = async () => {
  if (typeof globalThis.cutrail?.getThemePrimaryColor !== 'function') {
    return defaultThemePrimaryColor;
  }

  try {
    const color = await globalThis.cutrail.getThemePrimaryColor();

    return isThemePrimaryColorValue(color) ? color : defaultThemePrimaryColor;
  } catch {
    return defaultThemePrimaryColor;
  }
};

const bootstrapRenderer = async (): Promise<void> => {
  const initialPrimaryColor = await resolveThemePrimaryColor();
  applyRendererTheme(initialPrimaryColor);

  if (typeof globalThis.cutrail?.onThemePrimaryColorUpdated === 'function') {
    globalThis.cutrail.onThemePrimaryColorUpdated((nextColor) => {
      if (isThemePrimaryColorValue(nextColor)) {
        applyRendererTheme(nextColor);
      }
    });
  }

  createRoot(rootContainer).render(
    <StrictMode>
      {getRendererApp()}
    </StrictMode>,
  );
};

try {
  await bootstrapRenderer();
} catch (error) {
  globalThis.console.error('Renderer bootstrap failed.', error);
  applyRendererTheme(defaultThemePrimaryColor);

  createRoot(rootContainer).render(
    <StrictMode>
      {getRendererApp()}
    </StrictMode>,
  );
}
