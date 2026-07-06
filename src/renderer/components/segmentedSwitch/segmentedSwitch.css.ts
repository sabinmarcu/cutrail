import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const root = style({
  display: 'inline-flex',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  overflow: 'hidden',
});

export const optionButton = style({
  background: '#000f0a',
  borderInlineStart: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.secondary.base,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  paddingBlock: `${theme.grid.xxs}`,
  paddingInline: `${theme.grid.s}`,
  textTransform: 'uppercase',
  ':last-child': {
    borderRight: 'none',
  },
  ':disabled': {
    background: theme.colors.primary.base,
    color: theme.colors.primary.contrast,
    cursor: 'default',
  },
});
