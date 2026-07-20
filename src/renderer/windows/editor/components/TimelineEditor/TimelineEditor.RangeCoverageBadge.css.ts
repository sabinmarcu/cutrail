import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

export const rangeCoverageOverlayRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.xxs,
  insetBlockStart: 'calc(20% + 2px)',
  insetInlineStart: '0',
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 7,
});

export const rangeCoverageBadge = recipe({
  base: {
    alignItems: 'center',
    background: 'var(--cutrail-surface-dark)',
    borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
    borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
    borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
    borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
    color: theme.colors.secondary.base,
    cursor: 'help',
    display: 'inline-flex',
    fontSize: '0.56rem',
    fontWeight: 700,
    justifyContent: 'center',
    letterSpacing: '0.04em',
    lineHeight: 1,
    minInlineSize: '2rem',
    paddingBlock: '1px',
    paddingInline: '4px',
    pointerEvents: 'auto',
    textTransform: 'uppercase',
    selectors: {
      '&:focus-visible': {
        outline: `1px solid ${theme.colors.secondary.emphasis}`,
        outlineOffset: '1px',
      },
    },
  },
  variants: {
    tone: {
      draft: {
        borderBlockEndColor: theme.colors.primary.base,
        borderBlockStartColor: theme.colors.primary.base,
        borderInlineEndColor: theme.colors.primary.base,
        borderInlineStartColor: theme.colors.primary.base,
        color: theme.colors.primary.base,
      },
      exporting: {
        borderBlockEndColor: theme.colors.secondary.emphasis,
        borderBlockStartColor: theme.colors.secondary.emphasis,
        borderInlineEndColor: theme.colors.secondary.emphasis,
        borderInlineStartColor: theme.colors.secondary.emphasis,
        color: theme.colors.secondary.emphasis,
      },
      exported: {
        borderBlockEndColor: theme.colors.secondary.base,
        borderBlockStartColor: theme.colors.secondary.base,
        borderInlineEndColor: theme.colors.secondary.base,
        borderInlineStartColor: theme.colors.secondary.base,
        color: theme.colors.secondary.base,
      },
    },
  },
});

export const rangeCoverageBadgeIcon = style({
  fontSize: '1.5em',
  lineHeight: 0.8,
});

export const rangeCoverageBadgeCount = style({
  fontSize: '1em',
});

export const rangeCoverageTooltip = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: `1px solid ${theme.colors.secondary.emphasis}`,
  borderInlineEnd: `1px solid ${theme.colors.secondary.emphasis}`,
  borderBlockStart: `1px solid ${theme.colors.secondary.emphasis}`,
  borderBlockEnd: `1px solid ${theme.colors.secondary.emphasis}`,
  color: theme.colors.secondary.base,
  fontSize: '0.68rem',
  fontWeight: 600,
  inset: 'auto',
  insetInlineStart: 'var(--tooltip-x, 0px)',
  lineHeight: 1.2,
  maxInlineSize: '18rem',
  overflow: 'hidden',
  paddingBlock: '4px',
  paddingInline: '6px',
  pointerEvents: 'none',
  position: 'fixed',
  textTransform: 'none',
  insetBlockStart: 'var(--tooltip-y, 0px)',
  transform: 'translate(-50%, calc(-100% - 8px))',
  zIndex: 30,
  selectors: {
    '&::backdrop': {
      background: 'transparent',
    },
    '&::after': {
      borderInlineStart: '5px solid transparent',
      borderInlineEnd: '5px solid transparent',
      borderBlockStart: `5px solid ${theme.colors.secondary.emphasis}`,
      content: '',
      insetBlockStart: '100%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translateX(-50%)',
    },
  },
});
