import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const audioTracksSection = style({
  background: 'var(--cutrail-surface-elevated)',
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gap: theme.grid.xs,
  paddingBlock: theme.grid.s,
  paddingInline: theme.grid.s,
});

export const audioTracksHeader = style({
  alignItems: 'baseline',
  display: 'flex',
  gap: theme.grid.s,
  justifyContent: 'space-between',
});

export const audioTracksHeading = style({
  color: theme.colors.primary.base,
  fontSize: '0.78rem',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase',
});

export const audioTracksHint = style({
  color: theme.colors.secondary.base,
  fontSize: '0.72rem',
  margin: 0,
});

export const audioTrackList = style({
  display: 'grid',
  gap: theme.grid.xs,
});

export const audioTrackRow = style({
  alignItems: 'center',
  columnGap: theme.grid.s,
  display: 'grid',
  gridTemplateColumns: 'minmax(12rem, 14rem) minmax(0, 1fr)',
  rowGap: theme.grid.xxs,
  '@media': {
    'screen and (max-width: 980px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const audioTrackMeta = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.xs,
  justifyContent: 'space-between',
});

export const audioTrackLabel = style({
  color: theme.colors.primary.emphasis,
  fontSize: '0.72rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
});

export const muteButton = style({
  blockSize: '1.7rem',
  fontSize: '0.66rem',
  minInlineSize: '4.5rem',
  paddingInline: theme.grid.xs,
});

export const waveformFrame = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  blockSize: '3rem',
  overflow: 'hidden',
  position: 'relative',
});

export const waveformImage = style({
  blockSize: '100%',
  display: 'block',
  filter: 'var(--cutrail-waveform-filter)',
  inlineSize: '100%',
  objectFit: 'cover',
  opacity: 0.95,
});

export const waveformFallback = style({
  alignItems: 'center',
  color: theme.colors.secondary.base,
  display: 'flex',
  fontSize: '0.68rem',
  inset: 0,
  justifyContent: 'center',
  position: 'absolute',
  textTransform: 'uppercase',
});

export const waveformClipRange = style({
  background: theme.colors.primary.base,
  blockSize: '100%',
  insetBlock: 0,
  opacity: 0.22,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 1,
});

export const waveformClipRangeSelected = style({
  opacity: 0.34,
});

export const waveformPlayhead = style({
  background: theme.colors.secondary.emphasis,
  insetBlock: 0,
  inlineSize: '2px',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 2,
});

export const mutedWaveform = style({
  opacity: 0.38,
});
