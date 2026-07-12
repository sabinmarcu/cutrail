import {
  defaultThemePrimaryColor,
  isThemePrimaryColorValue,
  normalizeThemePrimaryColor,
  type ThemePrimaryColorValue,
} from '../shared/themePrimaryColor';

export const createRendererThemeConfig = (
  primaryColor: ThemePrimaryColorValue = defaultThemePrimaryColor,
) => ({
  primary: normalizeThemePrimaryColor(primaryColor),
  secondary: normalizeThemePrimaryColor(primaryColor),
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

const mixColor = (base: string, reference: string, amount: number): string => (
  `color-mix(in oklch, ${base}, ${reference} ${amount}%)`
);

const parseHexColor = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = normalizeThemePrimaryColor(hex);

  if (!isThemePrimaryColorValue(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

const rgbToHue = ({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): number => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) {
    return 0;
  }

  if (max === red) {
    return (60 * ((green - blue) / delta) + 360) % 360;
  }

  if (max === green) {
    return (60 * ((blue - red) / delta) + 120) % 360;
  }

  return (60 * ((red - green) / delta) + 240) % 360;
};

const resolveWaveformFilter = (primaryColor: string): string => {
  const sourceWaveformHue = 146;
  const rgb = parseHexColor(primaryColor);

  if (!rgb) {
    return 'none';
  }

  const targetHue = rgbToHue(rgb);
  const hueDelta = targetHue - sourceWaveformHue;

  return `hue-rotate(${hueDelta.toFixed(2)}deg) saturate(1.2)`;
};

const resolvePrimaryColor = (primaryColor: ThemePrimaryColorValue): string => {
  const normalized = normalizeThemePrimaryColor(primaryColor);

  return isThemePrimaryColorValue(normalized)
    ? normalized
    : defaultThemePrimaryColor;
};

export const applyRendererTheme = (primaryColor: ThemePrimaryColorValue): void => {
  const resolvedPrimary = resolvePrimaryColor(primaryColor);
  const root = document.documentElement;
  const deepSurface = mixColor(resolvedPrimary, 'black', 94);
  const panelSurface = mixColor(resolvedPrimary, 'black', 86);
  const elevatedSurface = mixColor(resolvedPrimary, 'black', 78);

  root.style.setProperty('--theme-colors-primary-base', resolvedPrimary);
  root.style.setProperty('--theme-colors-primary-emphasis', mixColor(resolvedPrimary, 'white', 22));
  root.style.setProperty('--theme-colors-primary-muted', mixColor(resolvedPrimary, 'black', 56));
  root.style.setProperty('--theme-colors-primary-contrast', mixColor(resolvedPrimary, 'black', 88));

  root.style.setProperty('--theme-colors-secondary-base', mixColor(resolvedPrimary, 'white', 30));
  root.style.setProperty('--theme-colors-secondary-emphasis', mixColor(resolvedPrimary, 'white', 46));
  root.style.setProperty('--theme-colors-secondary-muted', mixColor(resolvedPrimary, 'black', 44));
  root.style.setProperty('--theme-colors-secondary-contrast', mixColor(resolvedPrimary, 'black', 90));

  root.style.setProperty('--cutrail-surface-dark', deepSurface);
  root.style.setProperty('--cutrail-surface-panel', panelSurface);
  root.style.setProperty('--cutrail-surface-elevated', elevatedSurface);
  root.style.setProperty('--cutrail-overlay-soft', `color-mix(in oklch, ${deepSurface}, transparent 18%)`);
  root.style.setProperty('--cutrail-overlay-medium', `color-mix(in oklch, ${deepSurface}, transparent 8%)`);
  root.style.setProperty('--cutrail-overlay-strong', `color-mix(in oklch, ${deepSurface}, transparent 5%)`);
  root.style.setProperty('--cutrail-overlay-lock-dark', `color-mix(in oklch, ${deepSurface}, transparent 34%)`);
  root.style.setProperty('--cutrail-scanline-soft', `color-mix(in oklch, ${resolvedPrimary}, transparent 92%)`);
  root.style.setProperty('--cutrail-scanline-strong', `color-mix(in oklch, ${resolvedPrimary}, transparent 80%)`);
  root.style.setProperty('--cutrail-glow-soft', `color-mix(in oklch, ${resolvedPrimary}, transparent 92%)`);
  root.style.setProperty('--cutrail-glow-strong', `color-mix(in oklch, ${resolvedPrimary}, transparent 84%)`);
  root.style.setProperty('--cutrail-drop-shadow', `color-mix(in oklch, ${resolvedPrimary}, transparent 72%)`);
  root.style.setProperty('--cutrail-drag-active', `color-mix(in oklch, ${panelSurface}, transparent 45%)`);
  root.style.setProperty('--cutrail-waveform-filter', resolveWaveformFilter(resolvedPrimary));
};
