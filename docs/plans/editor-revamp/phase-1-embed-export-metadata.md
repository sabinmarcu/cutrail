# Phase 1: Embed Export Metadata

## Short Summary For Maintainer

Write export metadata directly into each generated clip so files are self-describing. This establishes filename-independent identity and removes pressure to encode growing state in output names.

## Detailed Agent Instructions

### Objective

Inject cutrail metadata into exported media containers during ffmpeg execution, including both compact discovery tags and full metadata payload.

Use Zod-validated metadata payloads before any serialization or ffmpeg argument emission.

### Steps

1. Extend ffmpeg command builder inputs to accept per-job metadata.
2. Encode compact discovery tags for quick detection.
3. Encode full metadata payload as serialized JSON in container metadata.
4. Ensure metadata writing works in both fast and accurate trim paths.
5. Keep existing filename strategy temporarily for compatibility.
6. Parse and validate metadata payloads with Zod before stringifying.

### Tag Strategy

Use two layers:

1. Discovery tags for fast scan:
   - cutrail_app
   - cutrail_schema
   - cutrail_clip_id
   - cutrail_source_fp
   - cutrail_variant_key
2. Full payload tag:
   - cutrail_export_json

### Implementation Notes

1. Keep metadata payload compact and stable-order when stringified.
2. Avoid absolute source-path storage in metadata.
3. Ensure special characters are safely encoded for ffmpeg metadata arguments.
4. Add guardrails if metadata exceeds safe size thresholds.
5. Reject malformed metadata inputs through Zod validation before export execution.

### Suggested Files And Split

Create or update the following files in this phase:

- `src/main/ipc/handlers/createExportPlan.ts`
   - Attach metadata envelopes to each export plan job.
- `src/infra/ffmpeg/buildFastTrimCommand.ts`
   - Accept metadata input and emit ffmpeg metadata arguments.
- `src/infra/ffmpeg/buildFastTrimCommand.spec.ts`
   - Assert metadata flags and payload encoding behavior.
- `src/infra/ffmpeg/exportMetadataArgs.ts`
   - Isolate argument construction for discovery tags and full JSON payload tag.
- `src/shared/exportMetadata.ts`
   - Reuse Zod schemas for pre-serialization validation.

Split rule for this phase:

1. Keep ffmpeg argument construction for metadata in a dedicated helper module.
2. Keep plan-building logic free of low-level ffmpeg argument details.

### Testing Requirements

1. Unit tests for argument generation include metadata flags.
2. Integration-style test for export run confirms metadata write step is attempted.
3. Failure handling test when metadata cannot be serialized.
4. Validation test ensures invalid metadata is rejected by Zod before command build.

### Exit Criteria

- Export jobs embed metadata in output files across supported trim modes.
- Existing export flow still succeeds for current users.
- No sync or UI dependence on metadata yet.
- Runtime metadata validation is enforced with Zod at export command boundaries.
