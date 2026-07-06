import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';
import { AppWindow } from '@renderer/windows/app/AppWindow';
import { AboutWindow } from '@renderer/windows/about/AboutWindow';
import { DiagnosticsWindow } from '@renderer/windows/diagnostics/DiagnosticsWindow';
import { EditorWindow } from '@renderer/windows/editor/EditorWindow';
import { LicensesWindow } from '@renderer/windows/licenses/LicensesWindow';
import { OptionsWindow } from '@renderer/windows/options/OptionsWindow';

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

  if (mode === 'licenses') {
    return <LicensesWindow />;
  }

  if (mode === 'options') {
    return <OptionsWindow />;
  }

  return <AppWindow />;
};

createRoot(document.querySelector('#root')).render(
  <StrictMode>
    {getRendererApp()}
  </StrictMode>,
);
