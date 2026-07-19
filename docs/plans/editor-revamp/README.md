# Editor Revamp Plan

## Short Summary For Maintainer

This plan redesigns editor clip identity and presentation so cutrail no longer depends on filename parsing. The core strategy is metadata-first clip identity embedded in each exported file, then a UI revamp that groups clips by range and variant (trim mode plus track selection) instead of only fast versus accurate.

The plan also includes real-time filesystem synchronization for source and output directories so list and editor views react to file add, change, and delete events.

The phases are ordered so we reduce risk first, then implement backend metadata and detection, then renderer/UI updates, and finally migration and rollout hardening.

## Phase Files

- [phase-0-scope-and-contracts.md](phase-0-scope-and-contracts.md)
- [phase-1-embed-export-metadata.md](phase-1-embed-export-metadata.md)
- [phase-2-metadata-readback-and-sync.md](phase-2-metadata-readback-and-sync.md)
- [phase-3-editor-ui-and-state-revamp.md](phase-3-editor-ui-and-state-revamp.md)
- [phase-4-migration-validation-and-rollout.md](phase-4-migration-validation-and-rollout.md)

## Non-Goals

- No output-directory sidecar files as primary storage.
- No broad transcoding feature expansion in this initiative.
- No release workflow changes unless required for validation.
- No JSON Schema authoring in this initiative.

## Scope Note: Filesystem Watchers

Filesystem watchers are in scope for this plan as a supporting capability, not a separate feature track.

- Source directory watch coverage updates list-window inventory and source-level clip badges.
- Output directory watch coverage updates clip discovery, metadata classification, and editor variant status.
- Watch pipelines must be debounced and event-coalesced to avoid UI churn during batch writes.

## Watcher Event Contract

Use this contract for all watcher-driven list/editor updates in this plan.

### Canonical Channels

1. `cutrail:source-directory-snapshot-updated`
2. `cutrail:output-directory-snapshot-updated`
3. `cutrail:watcher-health-updated`

### Snapshot Delivery Model

1. Emit snapshots, not raw file events.
2. Coalesce burst file events into one snapshot update.
3. Use monotonic `snapshotRevision` per watcher stream.
4. Renderer ignores snapshots older than the latest processed revision.

### Payload: Source Directory Snapshot

- `watcherType`: `source`
- `snapshotRevision`: number
- `sourceDirectory`: string
- `generatedAtMs`: number
- `videos`: array of source entries
- `changeSummary`:
	- `added`: number
	- `changed`: number
	- `removed`: number

Each source entry should include at minimum:

- `filePath`
- `fileName`
- `extension`
- `modifiedAtMs`
- `clipCount`
- `hasMetadataClips`
- `hasLegacyClips`

### Payload: Output Directory Snapshot

- `watcherType`: `output`
- `snapshotRevision`: number
- `sourcePath`: string
- `outputDirectory`: string
- `generatedAtMs`: number
- `clips`: array of enriched clip entries
- `changeSummary`:
	- `added`: number
	- `changed`: number
	- `removed`: number

Each clip entry should include at minimum:

- `filePath`
- `fileName`
- `classificationKind`: `metadata` | `legacy` | `foreign` | `invalid`
- `sourceFingerprint` when available
- `rangeKey` when available
- `variantKey` when available
- `trimMode` when available
- `selectedAudioTrackIndices` when available
- `mutedAudioTrackIndices` when available

### Payload: Watcher Health

- `watcherType`: `source` | `output`
- `state`: `active` | `degraded` | `stopped`
- `reason`: string
- `generatedAtMs`: number

### Validation Requirements

1. Define Zod schemas for all three payload families in shared modules.
2. Validate before IPC emission in main.
3. Validate again at renderer subscription boundaries.
4. On validation failure, drop payload and emit watcher-health degraded state.

### Backpressure And Debounce Targets

1. Debounce window target: 50-150ms.
2. Maximum snapshot frequency target: 10 per second per watcher stream.
3. Heavy parsing runs on scheduled refresh, not per filesystem event.

## Validation Standard

Use Zod as the runtime validation standard across all phases.

- Define runtime schemas with Zod at IPC and metadata boundaries.
- Derive TypeScript types from Zod schemas where practical to avoid contract drift.
- Keep validation logic centralized in shared or domain modules, not duplicated per caller.

## Global Implementation Rules For Agents

1. Keep each changed source file between 1 and 200 lines whenever practical; split modules if needed.
2. Follow current renderer architecture and styling constraints.
3. Keep domain logic pure where possible and isolate media probing or process concerns in infra modules.
4. Add tests for all new metadata encoding, decoding, and clip matching logic.
5. Preserve legacy behavior through fallback paths until migration is complete.
6. Run lint and typecheck validation before each phase handoff.
7. Use Zod for runtime validation; do not add JSON Schema artifacts in this plan.

## Suggested Module Layout

Use these as defaults unless a phase file defines a narrower scope.

- Shared contract and schema surface:
	- `src/shared/contracts.ts`
	- `src/shared/exportMetadata.ts`
- Domain key and normalization helpers:
	- `src/domain/exportMetadata.identity.ts`
	- `src/domain/exportMetadata.normalize.ts`
- Main IPC validation wiring:
	- `src/main/ipc/handlers/createExportPlan.ts`
	- `src/main/ipc/handlers/syncExistingExportClips.ts`
- FFmpeg metadata write/read infra:
	- `src/infra/ffmpeg/buildFastTrimCommand.ts`
	- `src/infra/ffmpeg/readClipMetadata.ts`
- Renderer state and UI wiring:
	- `src/renderer/core/clipping/clipping.types.ts`
	- `src/renderer/core/clipping/clipping.state.ts`
	- `src/renderer/windows/editor/EditorWindow.Sidebar.tsx`
