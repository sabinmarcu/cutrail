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

export const disabledRoot = style({
  opacity: 0.9,
});

export const optionButton = style({
  background: 'var(--cutrail-surface-panel)',
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
  selectors: {
    '&[data-selected="true"]': {
      background: theme.colors.primary.base,
      color: theme.colors.primary.contrast,
    },
    '&:disabled': {
      background: 'var(--cutrail-surface-panel)',
      color: theme.colors.secondary.base,
      cursor: 'default',
      opacity: 0.6,
    },
    '&[data-selected="true"]:disabled': {
      background: theme.colors.primary.muted,
      color: theme.colors.primary.contrast,
      opacity: 0.78,
    },
  },
  ':last-child': {
    borderRight: 'none',
  },
});
