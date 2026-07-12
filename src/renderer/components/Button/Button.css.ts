import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

export const button = recipe({
  base: {
    background: 'var(--cutrail-surface-elevated)',
    borderInlineStart: `1px solid ${theme.colors.primary.base}`,
    borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
    borderBlockStart: `1px solid ${theme.colors.primary.base}`,
    borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
    borderRadius: theme.grid.xxs,
    color: theme.colors.primary.emphasis,
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    paddingBlock: `${theme.grid.xs}`,
    paddingInline: `${theme.grid.m}`,
    textTransform: 'uppercase',
    transition: 'border-color 140ms ease, background-color 140ms ease, transform 80ms ease',
    ':hover': {
      borderColor: theme.colors.secondary.base,
      background: 'color-mix(in oklch, var(--cutrail-surface-elevated), white 8%)',
    },
    ':active': {
      borderColor: theme.colors.secondary.emphasis,
      background: 'var(--cutrail-surface-panel)',
      transform: 'translateY(1px)',
    },
    ':focus-visible': {
      outline: `1px solid ${theme.colors.secondary.emphasis}`,
      outlineOffset: '2px',
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.45,
    },
  },
  variants: {
    variant: {
      primary: {},
      secondary: {
        background: 'var(--cutrail-surface-panel)',
        borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
        borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
        borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
        borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
        color: theme.colors.secondary.base,
        ':hover': {
          background: 'var(--cutrail-surface-elevated)',
        },
      },
      danger: {
        background: 'var(--cutrail-surface-panel)',
        borderInlineStart: `1px solid ${theme.colors.error.emphasis}`,
        borderInlineEnd: `1px solid ${theme.colors.error.emphasis}`,
        borderBlockStart: `1px solid ${theme.colors.error.emphasis}`,
        borderBlockEnd: `1px solid ${theme.colors.error.emphasis}`,
        color: theme.colors.error.emphasis,
        ':hover': {
          background: 'var(--cutrail-surface-elevated)',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
