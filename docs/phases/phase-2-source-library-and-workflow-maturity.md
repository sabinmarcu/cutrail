# Phase 2: Source Library And Workflow Maturity

## Intent

Phase 2 turns the MVP from a single-session demo into a repeatable daily workflow. The emphasis is reducing setup friction, preserving useful context, and making the product practical for frequent clipping work.

## Primary Goals

- Add a source-library flow centered on configured folders.
- Introduce lightweight persistence for user defaults and recent context.
- Strengthen the queue and timeline interactions without changing the product’s narrow scope.

## Scope

### In scope

- Source folder configuration and scanning.
- Searchable list of available videos.
- Persistence for defaults and recent context.
- Queue retry and resilience improvements.
- Better multi-range editing ergonomics.

### Out of scope

- Collaborative or cloud features.
- Deep media metadata management.
- Full project files or heavy caching strategies.

## Dependencies And Inputs

- Phase 1 export workflow must already be stable.
- Settings and persistence choices should stay lightweight and local.

## Workstreams

### 1. Source Library

#### Outcomes

- Users can work from a configured source folder instead of reopening files one by one.

- State persistence expands beyond the existing output-directory baseline to cover recent items, source defaults, and export preferences.

- Add settings for source and output directories.
- Implement source-folder scanning and refresh behavior.
- Show a searchable/filterable video list.
- Support opening a selected library item in the clip editor.

#### Deliverables

- Library screen or panel with direct editor handoff.

### 2. State Persistence

#### Outcomes

- The app remembers enough to feel stable between launches.

#### Tasks

- Persist recent files, source folder, and export defaults while preserving the existing output-folder persistence flow.
- Restore last-used defaults safely.
- Keep persistence bounded and understandable; avoid aggressive background caching.

#### Deliverables

- Lightweight settings and recent-state storage.

### 3. Queue Resilience

#### Outcomes

- Export failures are easier to recover from.

#### Tasks

- Add retry behavior for failed jobs.
- Improve progress visibility and completion summaries.
- Add reveal-in-file-manager or equivalent result discovery flow if practical.

#### Deliverables

- More robust queue experience.

### 4. Timeline Interaction Improvements

#### Outcomes

- Multi-range editing becomes faster and less error-prone.

#### Tasks

- Tighten range editing interactions and validation messaging.
- Add guardrails for invalid overlaps or confusing edits.
- Improve navigation between ranges and export preparation.

#### Deliverables

- More efficient editing loop for repeated clipping.

## Recommended Execution Sequence

1. Add settings and persistence primitives.
2. Implement source-folder scanning and the library view.
3. Improve navigation into the editor and back to queue/settings.
4. Harden queue retry/recovery behavior.
5. Refine range-editing interactions after the surrounding workflow exists.

## Validation Checklist

- The app can remember configured folders and export defaults.
- A user can select a video from the library and open it in the editor.
- Failed jobs can be retried without rebuilding the whole session.
- Multi-range editing remains stable under repeated edits.

## Risks And Mitigations

- Persistence can become opaque or surprising.
  - Mitigation: store only low-risk, user-comprehensible state.
- Folder scanning may introduce performance issues on large collections.
  - Mitigation: keep the first implementation simple and measurable.
- Library work may distract from clip-export reliability.
  - Mitigation: keep all new workflows dependent on the already-proven Phase 1 engine.

## Exit Criteria

- Repeat users can process videos with materially less setup than in the MVP.
- The app feels persistent and navigable without growing into a media manager.

## Agent Notes

- Keep persistence explicit and minimal.
- Avoid inventing heavyweight caching or database layers unless the existing simple approach fails.