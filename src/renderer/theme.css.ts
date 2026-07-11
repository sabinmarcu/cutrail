import { setupTheme } from '@sabinmarcu/theme/ssr';
import {
  createRendererThemeConfig,
} from './theme.setup';

// Initialize @sabinmarcu/theme CSS variables for the renderer.
setupTheme(createRendererThemeConfig());

