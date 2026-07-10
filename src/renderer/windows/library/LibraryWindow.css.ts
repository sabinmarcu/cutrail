import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const shell = style({
  background: '#020805',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
});

export const controlsBar = style({
  display: 'grid',
  gridTemplateRows: 'auto auto',
});

export const controlsGrid = style({
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gap: theme.grid.xs,
  padding: theme.grid.s,
});

export const topRow = style({
  alignItems: 'end',
  columnGap: theme.grid.s,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  rowGap: theme.grid.xs,
});

export const dropdownRow = style({
  columnGap: theme.grid.xs,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  rowGap: theme.grid.xs,
});

export const searchControl = style({
  minInlineSize: 0,
});

export const viewControl = style({
  inlineSize: '13rem',
  justifySelf: 'end',
});

export const control = style({
  display: 'grid',
  gap: theme.grid.xxs,
  minInlineSize: 0,
});

export const controlLabel = style({
  color: theme.colors.secondary.base,
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase',
});

export const searchInput = style({
  background: '#010f0a',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.primary.emphasis,
  fontSize: '0.86rem',
  minBlockSize: '2.35rem',
  paddingInline: theme.grid.xs,
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

export const viewSwitch = style({
  blockSize: '2.35rem',
  inlineSize: '100%',
});

export const viewSwitchOption = style({
  blockSize: '100%',
  flex: 1,
  fontSize: '0.76rem',
  paddingInline: theme.grid.m,
});

export const body = style({
  display: 'grid',
  gap: theme.grid.m,
  minBlockSize: 0,
  overflowInline: 'hidden',
  overflowBlock: 'auto',
  padding: theme.grid.m,
});

export const pathBar = style({
  background: '#000f0a',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.secondary.base,
  display: 'grid',
  gap: theme.grid.xxs,
  margin: 0,
  padding: theme.grid.xs,
});

export const group = style({
  display: 'grid',
  gap: theme.grid.s,
});

export const groupTitle = style({
  color: theme.colors.primary.base,
  fontSize: '0.82rem',
  letterSpacing: '0.1em',
  margin: 0,
  textTransform: 'uppercase',
});

export const videosGrid = style({
  display: 'grid',
  gap: theme.grid.s,
  gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
});

export const videosList = style({
  display: 'grid',
  gap: theme.grid.s,
  gridTemplateColumns: 'minmax(0, 1fr)',
});

export const card = style({
  background: '#020b07',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gap: theme.grid.xs,
  padding: theme.grid.s,
});

export const listCard = style({
  alignItems: 'stretch',
  columnGap: theme.grid.m,
  gridTemplateColumns: '20rem minmax(0, 1fr)',
});

export const previewCell = style({
  minInlineSize: 0,
});

export const cardContent = style({
  alignContent: 'start',
  display: 'grid',
  gap: theme.grid.xxs,
  minInlineSize: 0,
});

export const listCardContent = style({
  blockSize: '100%',
});

export const cardActions = style({
  marginBlockStart: 'auto',
});

export const cardTitle = style({
  color: theme.colors.primary.emphasis,
  fontSize: '0.86rem',
  letterSpacing: '0.04em',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const cardMeta = style({
  color: theme.colors.secondary.base,
  fontSize: '0.75rem',
  margin: 0,
});

export const empty = style({
  color: theme.colors.secondary.base,
  fontSize: '0.82rem',
  margin: 0,
  textTransform: 'uppercase',
});
