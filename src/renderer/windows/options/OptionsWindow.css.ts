import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const panel = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  display: 'grid',
  gap: theme.grid.s,
  padding: theme.grid.s,
});

export const heading = style({
  color: theme.colors.primary.base,
  fontSize: '0.84rem',
  letterSpacing: '0.1em',
  margin: 0,
  textTransform: 'uppercase',
});

export const pathValue = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  color: theme.colors.primary.emphasis,
  fontSize: '0.8rem',
  margin: 0,
  overflowInline: 'auto',
  paddingBlock: `${theme.grid.xs}`,
  paddingInline: `${theme.grid.s}`,
  whiteSpace: 'nowrap',
});

export const helperText = style({
  color: theme.colors.secondary.emphasis,
  fontSize: '0.76rem',
  margin: 0,
});

export const headerRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.s,
  justifyContent: 'space-between',
});

export const headerControl = style({
  marginInlineStart: 'auto',
});

export const colorControlRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.s,
});

export const colorInput = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  blockSize: '2rem',
  cursor: 'pointer',
  inlineSize: '3.2rem',
  padding: 0,
});

export const colorValue = style({
  color: theme.colors.primary.emphasis,
  fontSize: '0.82rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
});

export const checkboxRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.s,
});

export const checkboxInput = style({
  accentColor: theme.colors.secondary.base,
  blockSize: '1rem',
  cursor: 'pointer',
  inlineSize: '1rem',
  margin: 0,
});

export const checkboxLabel = style({
  color: theme.colors.primary.emphasis,
  fontSize: '0.8rem',
  lineHeight: 1.4,
});
