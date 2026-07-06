import { globalStyle } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

globalStyle(':root', {
  vars: {
    '--cutrail-window-border-size': '1px',
  },
  colorScheme: 'dark',
  fontFamily: "'Space Mono', 'IBM Plex Mono', 'Cascadia Mono', 'Consolas', 'Courier New', monospace",
});

globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('html, body, #root', {
  blockSize: '100%',
  margin: 0,
  overflow: 'hidden',
});

globalStyle('body', {
  backgroundColor: 'transparent',
  color: theme.colors.primary.contrast,
  lineHeight: 1.45,
});

globalStyle('#root', {
  borderRadius: '8px',
  overflow: 'hidden',
});

globalStyle('#root > *', {
  blockSize: 'calc(100% - (var(--cutrail-window-border-size) * 2))',
  inlineSize: 'calc(100% - (var(--cutrail-window-border-size) * 2))',
  borderRadius: '8px',
  overflow: 'hidden',
  borderInlineStart: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  borderBlockStart: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  boxShadow: '0 0 0 1px rgba(49, 255, 145, 0.10), 0 10px 24px rgba(0, 0, 0, 0.45)',
});

globalStyle('button', {
  fontFamily: 'inherit',
});
