import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const page = style({
  display: 'grid',
  blockSize: '100%',
  overflow: 'hidden',
  padding: 0,
  inlineSize: '100%',
});

export const shell = style({
  background: theme.colors.background.surface,
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  borderRadius: 0,
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
  padding: 0,
  inlineSize: '100%',
  gap: 0,
  '@media': {
    'screen and (max-width: 820px)': {
      minBlockSize: 0,
      padding: 0,
    },
  },
});

export const workspaceGrid = style({
  alignItems: 'stretch',
  display: 'grid',
  gap: 0,
  blockSize: '100%',
  gridRow: '2',
  gridTemplateColumns: 'minmax(0, 5fr) minmax(18rem, 2fr)',
  minBlockSize: 0,
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 980px)': {
      gridTemplateColumns: '1fr',
      minBlockSize: 0,
    },
  },
});

export const editorColumn = style({
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  blockSize: '100%',
  minBlockSize: 0,
  minInlineSize: 0,
  overflow: 'hidden',
});

export const sideColumn = style({
  display: 'grid',
  gap: 0,
  gridTemplateRows: '1fr auto',
  minBlockSize: 0,
  minInlineSize: 0,
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 980px)': {
      gridTemplateRows: 'auto auto',
    },
  },
});

export const panel = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  display: 'grid',
  marginBlockStart: 0,
  minBlockSize: 0,
  padding: theme.grid.s,
});

export const clipPanel = style({
  gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
  overflow: 'hidden',
});

export const clipFilterSwitch = style({
  display: 'flex',
  inlineSize: '100%',
});

export const clipFilterOption = style({
  flex: '1 1 0',
  fontSize: '0.64rem',
  justifyContent: 'center',
  minInlineSize: 0,
  paddingInline: theme.grid.xxs,
  textAlign: 'center',
});

export const clipFilterHint = style({
  color: theme.colors.secondary.base,
  fontSize: '0.7rem',
  letterSpacing: '0.04em',
  margin: 0,
  opacity: 0.9,
  textTransform: 'uppercase',
});

export const controlsPanel = style({
  alignSelf: 'end',
  borderBlockStart: 'none',
  display: 'grid',
  gap: theme.grid.s,
});

export const editorPanel = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  borderRadius: 0,
  display: 'grid',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
  padding: 0,
});

export const panelHeaderRow = style({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.grid.xs,
});

export const panelHeading = style({
  color: theme.colors.primary.base,
  fontSize: '0.84rem',
  letterSpacing: '0.1em',
  marginBlockStart: '0',
  marginInline: '0',
  marginBlockEnd: `${theme.grid.xs}`,
  textTransform: 'uppercase',
});

export const clipList = style({
  alignContent: 'start',
  alignItems: 'start',
  display: 'grid',
  gap: theme.grid.m,
  listStyle: 'none',
  margin: 0,
  minBlockSize: 0,
  overflowBlock: 'auto',
  padding: 0,
});

export const clipItem = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  paddingBlock: `${theme.grid.xxs}`,
  paddingInline: `${theme.grid.xs}`,
});

export const clipTitle = style({
  color: theme.colors.primary.base,
  fontSize: '0.76rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  margin: 0,
  textTransform: 'uppercase',
});

export const clipHeaderRow = style({
  alignItems: 'baseline',
  display: 'flex',
  gap: theme.grid.s,
  justifyContent: 'space-between',
});

export const clipHeaderLabel = style({
  color: theme.colors.secondary.base,
  fontSize: '0.72rem',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '0.04em',
  textAlign: 'right',
});

export const clipMeta = style({
  color: theme.colors.secondary.base,
  fontSize: '0.74rem',
  lineHeight: 1.25,
});

export const clipCardMetaRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.m,
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  marginBlockStart: theme.grid.xxs,
  marginBlockEnd: theme.grid.xs,
  paddingBlock: theme.grid.xxs,
});

export const clipSegmentedSwitch = style({
  display: 'flex',
  flex: '1 1 auto',
  marginInlineEnd: theme.grid.xs,
  minInlineSize: '10rem',
});

export const clipSegmentedSwitchOption = style({
  flex: '1 1 0',
  fontSize: '0.62rem',
  justifyContent: 'center',
  minInlineSize: 0,
  paddingInline: theme.grid.xxs,
  textAlign: 'center',
});

export const clipActionRow = style({
  display: 'grid',
  gap: theme.grid.xxs,
  marginBlockStart: theme.grid.xxs,
});

export const clipVariantCard = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  cursor: 'pointer',
  display: 'grid',
  gap: theme.grid.xxs,
  outline: 'none',
  paddingBlock: theme.grid.xs,
  paddingInline: theme.grid.xs,
  selectors: {
    '&:hover': {
      borderBlockEndColor: theme.colors.primary.base,
      borderBlockStartColor: theme.colors.primary.base,
      borderInlineEndColor: theme.colors.primary.base,
      borderInlineStartColor: theme.colors.primary.base,
    },
    '&:focus-visible': {
      borderBlockEndColor: theme.colors.secondary.emphasis,
      borderBlockStartColor: theme.colors.secondary.emphasis,
      borderInlineEndColor: theme.colors.secondary.emphasis,
      borderInlineStartColor: theme.colors.secondary.emphasis,
    },
  },
});

export const clipVariantCardDraft = style({
  borderBlockStartColor: theme.colors.primary.base,
  borderInlineStartColor: theme.colors.primary.base,
});

export const clipVariantCardExisting = style({
  borderBlockStartColor: theme.colors.secondary.muted,
  borderInlineStartColor: theme.colors.secondary.muted,
});

export const clipVariantCardSelected = style({
  borderBlockEndColor: theme.colors.primary.base,
  borderBlockStartColor: theme.colors.primary.base,
  borderInlineEndColor: theme.colors.primary.base,
  borderInlineStartColor: theme.colors.primary.base,
  boxShadow: `0 0 0 1px ${theme.colors.primary.base}, 0 0 10px ${theme.colors.primary.muted}`,
});

export const clipVariantActions = style({
  display: 'grid',
  gap: theme.grid.xs,
  marginBlockStart: `calc(${theme.grid.s} + ${theme.grid.xs})`,
});

export const clipProgressBadge = style({
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  marginBlockStart: theme.grid.xxs,
  marginBlockEnd: theme.grid.xs,
  overflow: 'hidden',
  paddingBlock: theme.grid.xxs,
  paddingInline: theme.grid.xs,
  position: 'relative',
  textAlign: 'center',
  textTransform: 'uppercase',
});

export const clipProgressDraft = style({
  background: theme.colors.primary.muted,
  color: theme.colors.primary.contrast,
});

export const clipProgressExporting = style({
  background: theme.colors.secondary.emphasis,
  color: theme.colors.background.surface,
});

export const clipProgressExportingFill = style({
  background: theme.colors.primary.base,
  insetBlock: 0,
  insetInlineStart: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 1,
});

export const clipProgressExportingLabel = style({
  color: theme.colors.background.surface,
  position: 'relative',
  zIndex: 2,
});

export const clipProgressOnDisk = style({
  background: theme.colors.secondary.muted,
  color: theme.colors.secondary.contrast,
});

export const clipTrackGroup = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.s,
  justifyContent: 'flex-end',
  paddingInlineStart: theme.grid.xs,
});

export const clipTrackGroupLabel = style({
  color: theme.colors.secondary.base,
  fontSize: '0.68rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

export const clipTrackChipRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.grid.xxs,
  justifyContent: 'flex-end',
});

export const clipTrackChip = style({
  alignItems: 'center',
  blockSize: '1.5rem',
  borderInlineStart: `1px solid ${theme.colors.primary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
  borderBlockStart: `1px solid ${theme.colors.primary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
  color: theme.colors.primary.base,
  display: 'inline-flex',
  fontSize: '0.68rem',
  fontWeight: 700,
  inlineSize: '1.35rem',
  justifyContent: 'center',
  textTransform: 'uppercase',
});

export const clipTrackChipButton = style({
  cursor: 'pointer',
  padding: 0,
});

export const clipTrackChipDisabled = style({
  cursor: 'default',
  opacity: 0.7,
});

export const clipTrackChipActive = style({
  background: theme.colors.primary.base,
  color: theme.colors.primary.contrast,
});

export const clipTrackChipMuted = style({
  background: 'transparent',
  color: theme.colors.primary.base,
});

export const clipActionButton = style({
  alignItems: 'center',
  display: 'inline-flex',
  gap: theme.grid.xxs,
  blockSize: '1.6rem',
  justifyContent: 'center',
  minInlineSize: 0,
  paddingBlock: 0,
  paddingInline: theme.grid.xxs,
  fontSize: '0.62rem',
  inlineSize: '100%',
});

export const sideActions = style({
  display: 'grid',
  gap: theme.grid.xs,
});

export const switchRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.s,
  justifyContent: 'space-between',
});

export const switchLabel = style({
  color: theme.colors.secondary.base,
  fontSize: '0.76rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});

export const switchInput = style({
  accentColor: theme.colors.secondary.base,
  cursor: 'pointer',
  blockSize: '1rem',
  inlineSize: '1rem',
});

export const errorText = style({
  color: theme.colors.error.emphasis,
  margin: 0,
});
