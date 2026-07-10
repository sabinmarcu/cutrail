import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const panel = style({
  background: '#020805',
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
  background: '#000f0a',
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

export const controlSelect = style({
  background: '#010f0a',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.primary.emphasis,
  minBlockSize: '1.9rem',
  paddingInline: theme.grid.xs,
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
