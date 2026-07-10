import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const preview = style({
  display: 'grid',
  gap: theme.grid.xxs,
  marginInline: `-${theme.grid.xs}`,
});

export const frame = style({
  cursor: 'grab',
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const actionsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.grid.xxs,
  marginBlockStart: theme.grid.xxs,
});

export const actionButton = style({
  alignItems: 'center',
  display: 'inline-flex',
  flex: 1,
  gap: theme.grid.xxs,
  blockSize: '1.6rem',
  justifyContent: 'center',
  minInlineSize: 0,
  paddingBlock: 0,
  paddingInline: theme.grid.xxs,
  fontSize: '0.62rem',
});
