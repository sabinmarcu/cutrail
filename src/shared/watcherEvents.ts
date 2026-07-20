import { z } from 'zod';
import { existingExportClipSnapshotSchema } from './exportMetadata.ts';

const watcherChangeSummarySchema = z.object({
  added: z.number().int().nonnegative(),
  changed: z.number().int().nonnegative(),
  removed: z.number().int().nonnegative(),
}).strict();

const sourceDirectoryEntrySchema = z.object({
  filePath: z.string().min(1),
  fileName: z.string().min(1),
  extension: z.string().min(1),
  modifiedAtMs: z.number().finite().nonnegative(),
  clipCount: z.number().int().nonnegative(),
  hasMetadataClips: z.boolean(),
  hasLegacyClips: z.boolean(),
}).strict();

export const sourceDirectorySnapshotSchema = z.object({
  watcherType: z.literal('source'),
  snapshotRevision: z.number().int().nonnegative(),
  sourceDirectory: z.string(),
  generatedAtMs: z.number().finite().nonnegative(),
  videos: z.array(sourceDirectoryEntrySchema),
  changeSummary: watcherChangeSummarySchema,
}).strict();

export const outputDirectorySnapshotSchema = z.object({
  watcherType: z.literal('output'),
  snapshotRevision: z.number().int().nonnegative(),
  sourcePath: z.string(),
  outputDirectory: z.string(),
  generatedAtMs: z.number().finite().nonnegative(),
  clips: z.array(existingExportClipSnapshotSchema),
  changeSummary: watcherChangeSummarySchema,
}).strict();

export const watcherHealthSchema = z.object({
  watcherType: z.enum(['source', 'output']),
  state: z.enum(['active', 'degraded', 'stopped']),
  reason: z.string(),
  generatedAtMs: z.number().finite().nonnegative(),
}).strict();

export const WATCHER_CHANNELS = {
  sourceSnapshotUpdated: 'cutrail:source-directory-snapshot-updated',
  outputSnapshotUpdated: 'cutrail:output-directory-snapshot-updated',
  watcherHealthUpdated: 'cutrail:watcher-health-updated',
} as const;

export type SourceDirectoryEntry = z.infer<typeof sourceDirectoryEntrySchema>;
export type WatcherChangeSummary = z.infer<typeof watcherChangeSummarySchema>;
export type SourceDirectorySnapshotPayload = z.infer<typeof sourceDirectorySnapshotSchema>;
export type OutputDirectorySnapshotPayload = z.infer<typeof outputDirectorySnapshotSchema>;
export type WatcherHealthPayload = z.infer<typeof watcherHealthSchema>;
