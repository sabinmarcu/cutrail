# Phase 3: Editor UI And State Revamp

## Short Summary For Maintainer

Revamp editor clip presentation to group by range first, then show export variants under each range. This makes fast versus accurate plus track combinations understandable and actionable.

## Detailed Agent Instructions

### Objective

Implement a range-first, variant-aware state and UI model in editor timeline and clips list, driven by metadata identity rather than filename heuristics.

Use Zod-validated payloads for all metadata-derived state entering renderer hooks.

Apply watcher-driven updates so list and editor views react to source/output filesystem changes in near real time.

Renderer subscriptions must consume the canonical watcher event channels and payloads from the watcher event contract.

### Steps

1. Replace whole-second range keying with millisecond identity keys.
2. Introduce variant-aware clip entries in clipping state.
3. Group clips by range, then by variant in sidebar list.
4. Add status model per variant: planned, exporting, exported, failed, legacy, foreign.
5. Update timeline overlays to reflect variant coverage for each range.
6. Move trim mode and track selection to per-range configuration with bulk-apply helpers.
7. Ensure renderer-side state builders consume Zod-validated snapshot shapes.
8. Wire watcher-driven snapshot events into list and editor state subscriptions.
9. Add source-level clip badges in list view for new source files and detected clip counts.
10. Ignore stale watcher snapshots by `snapshotRevision` ordering.

### UI Requirements

1. Clips list must show one range row with expandable variant rows.
2. Variant row must include trim mode and track selection summary.
3. Existing clip preview actions remain available per variant.
4. Provide filter toggles:
   - matching current source and plan
   - matching current source only
   - legacy clips
   - foreign clips
5. List view must show source badges that reflect watcher-updated clip availability and freshness.

### Interaction Rules

1. Removing a variant removes only that variant export.
2. Removing a range can remove all variants for that range after explicit confirmation.
3. Locked-state behavior must be variant-aware, not range-binary only.

### Suggested Files And Split

Create or update the following files in this phase:

- `src/renderer/core/clipping/clipping.types.ts`
   - Add variant-aware types and classification enums.
- `src/renderer/core/clipping/clipping.state.ts`
   - Build range-first grouping and variant-level derived state.
- `src/renderer/core/clipping/clipping.actions.ts`
   - Add remove-variant and remove-range semantics.
- `src/renderer/core/clipping/clipping.subscriptions.ts`
   - Consume enriched snapshots and map invalid/legacy/foreign behavior.
- `src/renderer/core/watchers/watcherSubscriptions.ts`
   - Subscribe to canonical watcher channels and validate payloads with shared schemas.
- `src/renderer/core/watchers/watcherState.ts`
   - Track latest processed snapshot revision per watcher stream.
- `src/renderer/windows/library/*`
   - Consume source-directory watcher snapshots and render source clip badges.
- `src/renderer/windows/editor/EditorWindow.Sidebar.tsx`
   - Render grouped range rows and variant rows.
- `src/renderer/windows/editor/components/TimelineEditor/*`
   - Render range overlays reflecting per-variant export coverage.

Split rule for this phase:

1. Keep derivation logic in clipping core modules, not directly in window components.
2. Keep presentation-only components free of export identity algorithms.
3. If list rendering grows too large, split row components into dedicated files.
4. Keep watcher event handling in subscription hooks, not direct component effect chains.
5. Keep stale-snapshot filtering in watcher core modules, not window components.

### Testing Requirements

1. State reducer or hook tests for grouping and status derivation.
2. Component tests for rendering grouped ranges and variants.
3. Behavior tests for remove-variant vs remove-range actions.
4. Tests for invalid snapshot payload handling and safe fallback behavior.
5. Watcher event tests for live badge and clip-list updates without manual refresh.
6. Stale-snapshot tests ensure out-of-order payloads do not regress UI state.

### Exit Criteria

- Sidebar and timeline both represent range plus variant identity clearly.
- Users can distinguish and manage multiple exports per same range.
- UI no longer implies trim mode is only global.
- Variant state derivation uses only schema-validated inputs.
- List and editor views react correctly to source/output file add, change, and delete events.
