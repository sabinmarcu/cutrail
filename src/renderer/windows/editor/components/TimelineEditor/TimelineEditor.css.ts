import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

export const editor = style({
  display: 'grid',
  gap: 0,
  gridTemplateRows: 'minmax(12rem, 1fr) auto',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
  overflowInline: 'hidden',
});

export const controlsStack = style({
  alignSelf: 'end',
  minBlockSize: 0,
  overflowBlock: 'auto',
  overflowInline: 'hidden',
});

export const playbackSection = style({
  display: 'grid',
  gap: 0,
  minBlockSize: 0,
  overflow: 'hidden',
});

export const overlayPlayButton = style({
  alignItems: 'center',
  background: 'rgba(2, 8, 5, 0.82)',
  borderInlineStart: `1px solid ${theme.colors.primary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
  borderBlockStart: `1px solid ${theme.colors.primary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
  borderRadius: '999px',
  color: theme.colors.primary.emphasis,
  cursor: 'default',
  display: 'inline-flex',
  justifyContent: 'center',
  insetInlineStart: '50%',
  blockSize: '3rem',
  inlineSize: '3rem',
  opacity: 0,
  pointerEvents: 'none',
  position: 'absolute',
  insetBlockStart: '50%',
  transform: 'translate(-50%, -50%)',
  transition: 'opacity 180ms ease',
  zIndex: 8,
});

export const overlayPlayButtonVisible = style({
  opacity: 1,
});

export const timelineSection = style({
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gap: theme.grid.xs,
  marginBlockEnd: `${theme.grid.s}`,
  paddingBlockStart: `${theme.grid.s}`,
  paddingInline: `${theme.grid.s}`,
  paddingBlockEnd: '0',
});

export const videoFrame = style({
  aspectRatio: '16 / 9',
  background: '#020805',
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  borderRadius: 0,
  blockSize: '100%',
  inlineSize: '100%',
  minBlockSize: 0,
  minInlineSize: 0,
  maxBlockSize: '100%',
  overflow: 'hidden',
  position: 'relative',
  justifySelf: 'stretch',
  selectors: {
    '&::before': {
      background: '#020805',
      content: '',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 0,
    },
    '&::after': {
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(53, 255, 149, 0.08) 0 1px, transparent 1px 4px)',
      content: '',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1,
    },
  },
});

export const video = style({
  display: 'block',
  blockSize: '100%',
  background: 'transparent',
  transition: 'transform 220ms ease',
  transform: 'scale(1)',
  transformOrigin: 'center center',
  position: 'relative',
  inlineSize: '100%',
  zIndex: 2,
});

export const videoFitContain = style({
  objectFit: 'contain',
  transform: 'scale(1)',
});

export const videoFitCover = style({
  objectFit: 'cover',
  transform: 'scale(1.04)',
});

export const videoFitToggleButton = style({
  alignItems: 'center',
  background: 'rgba(2, 8, 5, 0.82)',
  borderInlineStart: `1px solid ${theme.colors.primary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
  borderBlockStart: `1px solid ${theme.colors.primary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
  borderRadius: '999px',
  color: theme.colors.primary.emphasis,
  cursor: 'pointer',
  display: 'inline-flex',
  blockSize: '2.15rem',
  inlineSize: '2.15rem',
  insetBlockEnd: `${theme.grid.xs}`,
  insetInlineEnd: `${theme.grid.xs}`,
  justifyContent: 'center',
  opacity: 0,
  padding: 0,
  pointerEvents: 'none',
  position: 'absolute',
  transition: 'background-color 180ms ease, color 180ms ease, opacity 180ms ease',
  zIndex: 9,
  selectors: {
    '&:hover': {
      background: 'rgba(2, 8, 5, 0.95)',
    },
    '&:focus-visible': {
      outline: `1px solid ${theme.colors.secondary.emphasis}`,
      outlineOffset: '1px',
    },
  },
});

export const videoFitToggleButtonVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
});

export const videoFitToggleIcon = style({
  transition: 'transform 220ms ease',
});

export const videoFitToggleIconActive = style({
  transform: 'rotate(45deg)',
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
    locked: {
      false: {},
      true: {
        background: theme.colors.background.text,
        borderColor: theme.colors.background.text,
        boxShadow: 'none',
        cursor: 'not-allowed',
        opacity: 1,
        selectors: {
          '&::after': {
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(2, 8, 5, 0.66) 0 5px, rgba(53, 255, 149, 0.2) 5px 10px)',
            content: '',
            inset: 0,
            pointerEvents: 'none',
            position: 'absolute',
            zIndex: 1,
          },
        },
      },
    },
    selected: {
      false: {},
      true: {
        background: theme.colors.secondary.base,
        borderColor: theme.colors.secondary.base,
      },
    },
  },
  compoundVariants: [
    {
      variants: {
        locked: true,
        selected: true,
      },
      style: {
        background: theme.colors.background.text,
        borderColor: theme.colors.background.text,
        outline: `1px solid ${theme.colors.error.emphasis}`,
        outlineOffset: '0',
      },
    },
  ],
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
