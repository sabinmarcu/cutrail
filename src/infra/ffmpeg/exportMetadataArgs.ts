import {
  exportClipMetadataSchema,
  EXPORT_METADATA_APP_NAME,
  EXPORT_METADATA_SCHEMA_VERSION,
  type ExportClipMetadata,
} from '../../shared/exportMetadata.ts';

const MAX_METADATA_JSON_LENGTH = 8192;

const sanitizeMetadataValue = (value: string): string => value
  .replaceAll('\u0000', '')
  .replaceAll('\r', ' ')
  .replaceAll('\n', ' ');

const serializeStableMetadata = (metadata: ExportClipMetadata): string => JSON.stringify({
  schemaVersion: metadata.schemaVersion,
  appName: metadata.appName,
  clipId: metadata.clipId,
  planId: metadata.planId,
  sourceFingerprint: metadata.sourceFingerprint,
  rangeMs: {
    startMs: metadata.rangeMs.startMs,
    endMs: metadata.rangeMs.endMs,
    durationMs: metadata.rangeMs.durationMs,
  },
  trimMode: metadata.trimMode,
  selectedAudioTrackIndices: metadata.selectedAudioTrackIndices,
  mutedAudioTrackIndices: metadata.mutedAudioTrackIndices,
  variantKey: metadata.variantKey,
  createdAtMs: metadata.createdAtMs,
});

export const buildExportMetadataArguments = (metadataInput: unknown): string[] => {
  const metadata = exportClipMetadataSchema.parse(metadataInput);
  const serialized = sanitizeMetadataValue(serializeStableMetadata(metadata));

  if (serialized.length > MAX_METADATA_JSON_LENGTH) {
    throw new RangeError(
      `cutrail_export_json metadata exceeds ${MAX_METADATA_JSON_LENGTH} bytes`,
    );
  }

  return [
    '-metadata',
    `cutrail_app=${EXPORT_METADATA_APP_NAME}`,
    '-metadata',
    `cutrail_schema=${EXPORT_METADATA_SCHEMA_VERSION}`,
    '-metadata',
    `cutrail_clip_id=${sanitizeMetadataValue(metadata.clipId)}`,
    '-metadata',
    `cutrail_source_fp=${sanitizeMetadataValue(metadata.sourceFingerprint)}`,
    '-metadata',
    `cutrail_variant_key=${sanitizeMetadataValue(metadata.variantKey)}`,
    '-metadata',
    `cutrail_export_json=${serialized}`,
  ];
};
