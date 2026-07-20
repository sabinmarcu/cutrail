import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

export const panel = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  padding: theme.grid.s,
});

export const panelTone = recipe({
  base: {},
  variants: {
    tone: {
      neutral: {},
      success: {
        borderColor: theme.colors.success.base,
      },
      danger: {
        borderColor: theme.colors.error.base,
      },
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export const heading = style({
  color: theme.colors.primary.base,
  fontSize: '0.84rem',
  letterSpacing: '0.1em',
  marginBlockStart: '0',
  marginInline: '0',
  marginBlockEnd: `${theme.grid.xs}`,
  textTransform: 'uppercase',
});

export const meta = style({
  color: theme.colors.secondary.emphasis,
  fontSize: '0.78rem',
  lineHeight: 1.4,
  margin: 0,
});

export const runtime = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  color: theme.colors.primary.emphasis,
  margin: 0,
  overflowInline: 'auto',
  padding: theme.grid.s,
  whiteSpace: 'pre-wrap',
});

export const keyValueGrid = style({
  display: 'grid',
  gap: theme.grid.xs,
});

export const keyValueItem = style({
  color: theme.colors.secondary.emphasis,
  fontSize: '0.76rem',
  lineHeight: 1.4,
  margin: 0,
});
