# Phase 2: Metadata Readback And Sync

## Short Summary For Maintainer

Switch clip detection from filename parsing to embedded metadata readback. Legacy filename parsing remains as fallback only.

In the same phase, add source and output directory watchers so list and editor data stay current without manual refresh.

## Detailed Agent Instructions

### Objective

Rework existing export-clip synchronization to probe media metadata, classify clips by metadata identity, and return richer snapshots to renderer state.

All decoded metadata must pass Zod validation before classification or renderer emission.

Add watcher-driven refresh triggers for list and editor windows on file add, change, and delete events.

Use the watcher event contract defined in `README.md` under "Watcher Event Contract" for channels, payloads, and delivery guarantees.

### Steps

1. Add infra helper to read metadata from media files.
2. Update sync-existing-export-clips handler to prefer metadata-based detection.
3. Keep legacy parse fallback for files without embedded metadata.
4. Add clip classification flags: metadata, legacy, foreign, invalid.
5. Update delete-range behavior to use metadata keys where available.
6. Validate decoded metadata payloads and outbound clip snapshots with Zod.
7. Add source-directory watcher flow for list-window source inventory updates.
8. Add output-directory watcher flow for clip re-sync and editor-state updates.
9. Debounce and coalesce watcher bursts before snapshot emission.
10. Emit contract-compliant source/output snapshot and watcher-health events.

### Watcher Design Rules

1. Watchers must be keyed by window or consumer context to avoid global cross-talk.
2. Watcher events should schedule refresh snapshots instead of performing per-event heavy parsing.
3. Watcher lifecycle must clean up on window close or source/output path change.
4. Watcher failure must degrade to manual refresh, not crash handlers.

### Sync Precedence Rules

1. If discovery tag indicates cutrail and full metadata validates, classify as metadata clip.
2. If tags missing or invalid but filename matches legacy pattern, classify as legacy clip.
3. If neither applies, classify as foreign and omit from range-lock logic by default.
4. If tags exist but fail Zod validation, classify as invalid and exclude from trusted matching.

### Data Contract Changes

Return enriched clip snapshot fields to renderer, including:

- metadataPresence
- identity keys
- selected and muted track indices
- classification kind

All outbound snapshot objects should conform to Zod-validated schemas before being emitted over IPC.

### Suggested Files And Split

Create or update the following files in this phase:

- `src/infra/ffmpeg/readClipMetadata.ts`
	- Add media metadata probe helper and normalized decode output.
- `src/infra/ffmpeg/readClipMetadata.spec.ts`
	- Add parser-focused tests for valid, invalid, and missing tags.
- `src/main/ipc/handlers/syncExistingExportClips.ts`
	- Implement metadata-first classification and fallback behavior.
- `src/main/ipc/handlers/deleteClipRangeOutputs.ts`
	- Update deletion matching to prefer metadata keys when available.
- `src/main/ipc/handlers/getVideoLibrary.ts`
	- Add source-list refresh integration with source-directory watch updates.
- `src/main/watchers/sourceDirectoryWatcher.ts`
	- Add debounced source-directory watcher orchestration.
- `src/main/watchers/outputDirectoryWatcher.ts`
	- Add debounced output-directory watcher orchestration.
- `src/main/watchers/watcherRegistry.ts`
	- Track watcher ownership and lifecycle by webContents or window context.
- `src/shared/watcherEvents.ts`
	- Define Zod schemas and types for watcher snapshot and health payloads.
- `src/main/watchers/watcherEmitter.ts`
	- Emit validated watcher payloads over canonical channels.
- `src/shared/contracts.ts`
	- Add enriched existing-clip snapshot fields.
- `src/shared/exportMetadata.ts`
	- Reuse Zod schemas for decoded metadata and emitted snapshots.

Split rule for this phase:

1. Keep media probing and metadata parsing in infra modules.
2. Keep classification policy and fallback ordering in main IPC handler modules.
3. Keep schema definitions out of handler files.
4. Keep watcher lifecycle/orchestration in dedicated watcher modules.
5. Keep watcher channel names and payload schemas centralized in shared watcher-event modules.

### Testing Requirements

1. Sync returns metadata clips for tagged files.
2. Sync returns legacy clips for old naming-only outputs.
3. Sync ignores unrelated files without false positives.
4. Delete flow removes correct variants for a given range and selection.
5. Invalid metadata payloads are classified safely and do not crash sync.
6. Source add, change, and delete events update list-window snapshots.
7. Output add, change, and delete events update editor clip snapshots.
8. Watcher bursts result in bounded snapshot refresh frequency.
9. Watcher snapshot payloads conform to shared Zod schemas before and after IPC transfer.

### Exit Criteria

- File identity no longer depends on filename for new clips.
- Legacy clips still appear and remain manageable.
- Snapshot payload supports variant-aware renderer behavior.
- Zod validation gates both decoded metadata and emitted snapshots.
- List and editor windows receive watcher-driven updates for source and output changes.
