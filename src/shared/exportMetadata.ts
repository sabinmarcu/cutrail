import { z } from 'zod';

export const EXPORT_METADATA_SCHEMA_VERSION = 1;
export const EXPORT_METADATA_APP_NAME = 'cutrail';

const nonNegativeIntegerSchema = z.number().int().nonnegative();
const nonNegativeFiniteNumberSchema = z.number().finite().nonnegative();

const trackIndexArraySchema = z.array(nonNegativeIntegerSchema).default([]);

const trimModeSchema = z.enum(['fast', 'accurate']);

export const exportRangeMillisecondsSchema = z.object({
  startMs: nonNegativeIntegerSchema,
  endMs: nonNegativeIntegerSchema,
  durationMs: nonNegativeIntegerSchema,
}).strict().superRefine((value, context) => {
  if (value.endMs < value.startMs) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endMs must be greater than or equal to startMs',
      path: ['endMs'],
    });
  }

  if (value.durationMs !== value.endMs - value.startMs) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'durationMs must equal endMs - startMs',
      path: ['durationMs'],
    });
  }
});

export const exportClipMetadataSchema = z.object({
  schemaVersion: z.literal(EXPORT_METADATA_SCHEMA_VERSION),
  appName: z.literal(EXPORT_METADATA_APP_NAME),
  clipId: z.string().min(1),
  planId: z.string().min(1),
  sourceFingerprint: z.string().min(1),
  rangeMs: exportRangeMillisecondsSchema,
  trimMode: trimModeSchema,
  selectedAudioTrackIndices: trackIndexArraySchema,
  mutedAudioTrackIndices: trackIndexArraySchema,
  variantKey: z.string().min(1),
  createdAtMs: nonNegativeIntegerSchema,
}).strict();

export const clipClassificationKindSchema = z.enum([
  'metadata',
  'legacy',
  'foreign',
  'invalid',
]);

export const clipIdentityKeysSchema = z.object({
  clipId: z.string().min(1).nullable(),
  planId: z.string().min(1).nullable(),
  sourceFingerprint: z.string().min(1).nullable(),
  variantKey: z.string().min(1).nullable(),
  rangeKey: z.string().min(1).nullable(),
}).strict();

export const existingExportClipSnapshotSchema = z.object({
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  modifiedAtMs: nonNegativeFiniteNumberSchema,
  sourceName: z.string().min(1),
  trimMode: trimModeSchema,
  range: z.object({
    start: z.number().finite(),
    end: z.number().finite(),
    duration: z.number().finite(),
  }).strict(),
  extension: z.string().min(1),
  metadata: exportClipMetadataSchema.nullable().optional(),
  metadataPresence: clipClassificationKindSchema,
  classificationKind: clipClassificationKindSchema,
  identityKeys: clipIdentityKeysSchema,
  selectedAudioTrackIndices: trackIndexArraySchema,
  mutedAudioTrackIndices: trackIndexArraySchema,
}).strict();

export const existingExportClipsSnapshotSchema = z.object({
  sourcePath: z.string().min(1),
  outputDirectory: z.string().min(1),
  clips: z.array(existingExportClipSnapshotSchema),
}).strict();

const exportRangeSecondsSchema = z.object({
  id: z.string().min(1).optional(),
  start: z.number().finite(),
  end: z.number().finite(),
  duration: z.number().finite().optional(),
}).strict();

export const createExportPlanPayloadSchema = z.object({
  sourcePath: z.string().min(1),
  outputDirectory: z.string().min(1),
  ranges: z.array(exportRangeSecondsSchema),
  extension: z.string().min(1).optional(),
  trimMode: trimModeSchema.optional(),
  audioStreamIndices: z.array(nonNegativeIntegerSchema).optional(),
  selectedAudioTrackIndices: z.array(nonNegativeIntegerSchema).optional(),
  mutedAudioTrackIndices: z.array(nonNegativeIntegerSchema).optional(),
}).strict();

const enrichedExportClipSnapshotSchema = z.object({
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  modifiedAtMs: nonNegativeFiniteNumberSchema,
  sourceName: z.string().min(1),
  trimMode: trimModeSchema,
  range: z.object({
    start: z.number().finite(),
    end: z.number().finite(),
    duration: z.number().finite(),
  }).strict(),
  extension: z.string().min(1),
  metadata: exportClipMetadataSchema.nullable().optional(),
}).strict();

export const enrichedExportClipsSnapshotSchema = z.object({
  sourcePath: z.string().min(1),
  outputDirectory: z.string().min(1),
  clips: z.array(enrichedExportClipSnapshotSchema),
}).strict();

export type ExportTrimMode = z.infer<typeof trimModeSchema>;
export type ExportRangeMilliseconds = z.infer<typeof exportRangeMillisecondsSchema>;
export type ExportClipMetadata = z.infer<typeof exportClipMetadataSchema>;
export type ClipClassificationKind = z.infer<typeof clipClassificationKindSchema>;
export type ClipIdentityKeys = z.infer<typeof clipIdentityKeysSchema>;
export type ExistingExportClipSnapshot = z.infer<typeof existingExportClipSnapshotSchema>;
export type ExistingExportClipsSnapshot = z.infer<typeof existingExportClipsSnapshotSchema>;
export type CreateExportPlanPayloadInput = z.infer<typeof createExportPlanPayloadSchema>;
export type EnrichedExportClipSnapshot = z.infer<typeof enrichedExportClipSnapshotSchema>;
export type EnrichedExportClipsSnapshot = z.infer<typeof enrichedExportClipsSnapshotSchema>;
