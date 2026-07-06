import { setupTheme } from '@sabinmarcu/theme/ssr';

// Initialize @sabinmarcu/theme CSS variables for the renderer.
setupTheme({
  primary: 'oklch(0.66 0.2 150)',
  secondary: 'oklch(0.75 0.15 145)',
  info: 'blue',
  success: 'lime',
  warning: 'yellow',
  error: 'red',
  background: {
    light: '#0c1a14',
    dark: '#020805',
  },
  grid: 16,
  breakpoint: {
    mobile: 700,
    tablet: 1000,
    screen: 1200,
    large: 1980,
    huge: 3000,
  },
});

