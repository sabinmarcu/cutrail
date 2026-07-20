# Phase 4: Migration, Validation, And Rollout

## Short Summary For Maintainer

Harden behavior, migrate safely from legacy naming-only clips, and verify the full workflow before cleanup of old assumptions.

## Detailed Agent Instructions

### Objective

Validate end-to-end reliability for metadata-first clip identity, then retire fragile filename assumptions in controlled steps.

Confirm Zod validation behavior under mixed and degraded data conditions before rollout completion.

### Steps

1. Add migration behavior for previously exported clips.
2. Add diagnostics surfacing clip classification and metadata health.
3. Validate export, sync, delete, and preview flows with mixed clip populations.
4. Decide and implement cleanup level for legacy parser dependence.
5. Update documentation for user-facing behavior changes.
6. Audit Zod schema coverage and error reporting for all metadata IPC paths.
7. Validate watcher stability across long-running sessions and rapid file churn.

### Migration Policy

1. Legacy clips remain visible and operable.
2. Legacy clips are explicitly labeled as legacy-detected.
3. Re-exporting a legacy range generates metadata-enabled clips.
4. No automatic file rename requirement.

### Validation Matrix

Run and record results for:

1. New exports with multiple ranges and mixed trim modes.
2. Per-range track variations including no-audio and multi-track mix.
3. Output directory with metadata clips, legacy clips, and unrelated clips.
4. Deletion actions at variant and range scopes.
5. Timeline and list consistency across app restart.
6. Source directory add, change, and delete events updating list-window badges.
7. Output directory add, change, and delete events updating editor clip rows and statuses.
8. Burst file operations ensuring debounced watcher refresh behavior remains responsive.

### Documentation Deliverables

1. Add an editor metadata behavior section in user docs.
2. Add watcher behavior notes for list and editor windows in user docs.
2. Update AI guidance docs if architecture or flow boundaries changed.
3. Capture known metadata limitations, such as external tools stripping metadata.
4. Document that runtime validation is Zod-based and JSON Schema is not part of this rollout.

### Suggested Files And Split

Create or update the following files in this phase:

- `src/main/ipc/handlers/syncExistingExportClips.ts`
	- Finalize legacy fallback behavior and diagnostics classification.
- `src/main/ipc/handlers/deleteClipRangeOutputs.ts`
	- Finalize variant-precise deletion behavior.
- `src/renderer/windows/editor/EditorWindow.Sidebar.tsx`
	- Finalize legacy and foreign labeling and operator affordances.
- `docs/plans/editor-revamp/*.md`
	- Keep phase progress notes and implementation deltas synchronized.
- `README.md`
	- Document user-facing behavior changes for clip classification and metadata.
- `.github/copilot-instructions.md`
	- Update AI guidance only if architecture/tooling guidance materially changed.

Split rule for this phase:

1. Keep migration diagnostics and classification logic separate from renderer presentation files.
2. Keep documentation updates grouped and explicit, not mixed with unrelated code-only changes.

### Exit Criteria

- Metadata-first flow is stable in manual validation and tests.
- Legacy fallback remains available but non-primary.
- Team can proceed with confidence to remove deeper filename coupling in later work.
- Zod validation failures are observable, actionable, and non-fatal to editor startup.
- Watcher-driven list and editor updates are stable under normal and burst filesystem activity.

## Implementation Status (2026-07-20)

Overall: PARTIAL

Completed:

1. Legacy fallback is retained and clips remain operable.
2. Metadata-first sync path is active for new clips.
3. Variant-precise deletion behavior is implemented.

Pending:

1. Diagnostics window does not yet expose dedicated clip-classification and metadata-health surfacing for this rollout.
2. Full validation matrix execution notes are not yet recorded in plan docs.
3. User-facing README/documentation updates specific to metadata-first editor behavior and watcher behavior are incomplete.
4. Watcher-contract hardening follow-ups remain: accurate `changeSummary` counters, precise source snapshot metadata/legacy flags, and watcher-contract tests.
5. Plan docs still need explicit progress notes per completed rollout checkpoint.

Notes:

- Phase 4 should be treated as active hardening/rollout work, not complete.
