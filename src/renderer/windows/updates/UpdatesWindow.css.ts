import {
  globalStyle,
  style,
} from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const panel = style({
  background: '#020805',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  padding: theme.grid.s,
});

export const progressPanel = style({
  background: '#020805',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  marginBlockStart: 'auto',
  padding: theme.grid.s,
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

export const message = style({
  color: theme.colors.secondary.emphasis,
  fontSize: '0.8rem',
  lineHeight: 1.45,
  margin: 0,
});

export const detailMarkdown = style({
  background: '#000f0a',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.primary.emphasis,
  marginBlockStart: `${theme.grid.s}`,
  minBlockSize: '8rem',
  padding: theme.grid.s,
});

globalStyle(`${detailMarkdown} :is(h1, h2, h3, h4)`, {
  color: theme.colors.primary.base,
  letterSpacing: '0.08em',
  marginBlock: `${theme.grid.s} ${theme.grid.xs}`,
  textTransform: 'uppercase',
});

globalStyle(`${detailMarkdown} p`, {
  color: theme.colors.secondary.emphasis,
  fontSize: '0.8rem',
  lineHeight: 1.45,
  marginBlock: `${theme.grid.xs}`,
});

globalStyle(`${detailMarkdown} ul, ${detailMarkdown} ol`, {
  color: theme.colors.secondary.emphasis,
  marginBlock: `${theme.grid.xs}`,
  paddingInlineStart: '1.2rem',
});

globalStyle(`${detailMarkdown} li`, {
  marginBlock: `${theme.grid.xs}`,
});

globalStyle(`${detailMarkdown} code`, {
  color: theme.colors.primary.emphasis,
  fontFamily: 'monospace',
});

globalStyle(`${detailMarkdown} pre`, {
  margin: 0,
  whiteSpace: 'pre-wrap',
});

globalStyle(`${detailMarkdown} a`, {
  color: theme.colors.primary.base,
});
