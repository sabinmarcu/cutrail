import {
  globalStyle,
  style,
} from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

export const rangeList = style({
  display: 'grid',
  gap: theme.grid.xxs,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const rangeRow = recipe({
  base: {
    alignItems: 'center',
    background: theme.colors.background.surface,
    borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
    borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
    borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
    borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
    borderRadius: 0,
    display: 'flex',
    gap: theme.grid.s,
    justifyContent: 'space-between',
    paddingBlock: `${theme.grid.xs}`,
    paddingInline: `${theme.grid.s}`,
    '@media': {
      'screen and (max-width: 760px)': {
        alignItems: 'stretch',
        flexDirection: 'column',
      },
    },
  },
  variants: {
    selected: {
      false: {},
      true: {
        borderColor: theme.colors.secondary.base,
      },
    },
  },
});

export const rangeLabel = style({
  color: theme.colors.secondary.base,
  fontVariantNumeric: 'tabular-nums',
});

globalStyle('button[data-timeline-range="true"]:focus-visible', {
  outline: `1px solid ${theme.colors.secondary.base}`,
  outlineOffset: '2px',
});
