import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

export const editor = style({
  display: 'grid',
  gap: 0,
  gridTemplateRows: 'minmax(0, 1fr) auto',
  blockSize: '100%',
  minBlockSize: 0,
});

export const playbackSection = style({
  display: 'grid',
  gap: 0,
  minBlockSize: 0,
});

export const overlayPlayButton = style({
  alignItems: 'center',
  background: theme.colors.background.surface,
  borderInlineStart: `1px solid ${theme.colors.primary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
  borderBlockStart: `1px solid ${theme.colors.primary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
  borderRadius: '999px',
  color: theme.colors.primary.emphasis,
  cursor: 'pointer',
  display: 'inline-flex',
  justifyContent: 'center',
  fontSize: '0.84rem',
  fontWeight: 600,
  insetInlineStart: '50%',
  minInlineSize: '6rem',
  opacity: 0,
  paddingBlock: `${theme.grid.xxs}`,
  paddingInline: `${theme.grid.s}`,
  pointerEvents: 'none',
  position: 'absolute',
  insetBlockStart: '50%',
  transform: 'translate(-50%, -50%)',
  transition: 'opacity 180ms ease',
  zIndex: 8,
});

export const overlayPlayButtonVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
});

export const timelineSection = style({
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gap: theme.grid.xs,
  paddingBlockStart: `${theme.grid.s}`,
  paddingInline: `${theme.grid.s}`,
  paddingBlockEnd: '0',
});

export const videoFrame = style({
  background: '#020805',
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  borderRadius: 0,
  blockSize: '100%',
  minBlockSize: '28rem',
  overflow: 'hidden',
  position: 'relative',
  selectors: {
    '&::before': {
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(53, 255, 149, 0.08) 0 1px, transparent 1px 4px)',
      content: '',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 0,
    },
  },
  '@media': {
    'screen and (max-width: 980px)': { minBlockSize: '18rem' },
  },
});

export const video = style({
  display: 'block',
  blockSize: '100%',
  objectFit: 'contain',
  position: 'relative',
  inlineSize: '100%',
  zIndex: 1,
});

export const emptyVideo = style({
  alignItems: 'center',
  color: theme.colors.secondary.base,
  display: 'flex',
  justifyContent: 'center',
  minBlockSize: '100%',
  padding: theme.grid.s,
  textAlign: 'center',
  textTransform: 'uppercase',
});

export const timelineControls = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.grid.xs,
  justifyContent: 'space-between',
});

export const timecode = style({
  color: theme.colors.secondary.base,
  fontVariantNumeric: 'tabular-nums',
  minInlineSize: '10rem',
});

export const timelineWrap = style({
  background: '#020805',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  blockSize: '4.7rem',
  overflow: 'hidden',
  padding: theme.grid.xs,
  position: 'relative',
});

export const timeline = style({
  background: '#020805',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  cursor: 'pointer',
  blockSize: '100%',
  position: 'relative',
  selectors: {
    '&::after': {
      background: '#000f0a',
      borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
      content: '',
      blockSize: '20%',
      inset: '0 0 auto 0',
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 2,
    },
    '&::before': {
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(53, 255, 149, 0.08) 0 1px, transparent 1px 4px)',
      content: '',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 3,
    },
  },
});

export const playhead = style({
  background: theme.colors.secondary.emphasis,
  boxShadow: `0 0 10px color-mix(in oklab, ${theme.colors.secondary.base} 45%, transparent)`,
  insetBlockEnd: 0,
  pointerEvents: 'none',
  position: 'absolute',
  insetBlockStart: 0,
  inlineSize: '2px',
  zIndex: 4,
});

export const rangeBlock = recipe({
  base: {
    background: theme.colors.primary.base,
    borderInlineStart: `1px solid ${theme.colors.primary.base}`,
    borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
    borderBlockStart: `1px solid ${theme.colors.primary.base}`,
    borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
    borderRadius: 0,
    insetBlockEnd: 0,
    cursor: 'grab',
    display: 'block',
    minInlineSize: '0.5rem',
    padding: 0,
    position: 'absolute',
    insetBlockStart: '20%',
    zIndex: 6,
  },
  variants: {
    selected: {
      false: {},
      true: {
        background: theme.colors.secondary.base,
        borderColor: theme.colors.secondary.base,
        boxShadow: `0 0 12px color-mix(in oklab, ${theme.colors.secondary.base} 35%, transparent)`,
      },
    },
  },
});

export const handle = recipe({
  base: {
    background: theme.colors.background.text,
    borderRadius: 0,
    insetBlockEnd: 0,
    position: 'absolute',
    insetBlockStart: 0,
    inlineSize: '0.28rem',
  },
  variants: {
    side: {
      start: {
        cursor: 'ew-resize',
        insetInlineStart: 0,
      },
      end: {
        cursor: 'ew-resize',
        insetInlineEnd: 0,
      },
    },
  },
});
