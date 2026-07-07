# Phase 1: Single-Video Clipping MVP

## Intent

Phase 1 delivers the first complete user workflow that justifies the product: load one video, define multiple clip ranges, and export them in one batch.

The goal is not visual polish or broad library management. The goal is a trustworthy end-to-end clipping loop.

## Primary Goals

- Implement the core clipping domain model.
- Build a reliable fast-trim export path around ffmpeg.
- Expose a focused editor and queue workflow in the UI.
- Make failures understandable enough for iteration and early use.
- Publish the Arch package set as `cutrail`, `cutrail-bin`, and `cutrail-git`, with `cutrail-bin` as the first install path once the MVP artifact contract is stable.

## Scope

### In scope

- Single-file ingest.
- Multiple clip ranges for one source.
- Batch export to an output folder.
- Progress and completion feedback.
- Basic export mode selection with fast trim as default.
- Initial `cutrail-bin` packaging based on the GitHub-hosted binary artifact.
- AUR publishing for the release-tagged and rolling package set.

### Out of scope

- Source-library browsing.
- Automatic project/session persistence.
- Rich presets or broad transcoding features.
- Full frame-accurate export as the default path.

## Dependencies And Inputs

- Phase 0 runtime and tooling baseline.
- ffmpeg command and architecture expectations from `docs/technical-background-and-plan.md`.

## Workstreams

### 1. Domain Modeling

#### Outcomes

- Clip ranges become explicit, validated application data instead of UI-only state.

#### Tasks

- Define types for source media, clip ranges, export jobs, and export results.
- Implement normalization rules for in/out ordering, empty ranges, and invalid duration.
- Decide how overlapping or duplicate ranges are handled.
- Implement deterministic output naming.

#### Deliverables

- Reusable domain utilities with tests.

### 2. ffmpeg Command Construction And Execution

#### Outcomes

- The export engine can build and run one output job per range.

#### Tasks

- Build a fast-trim command builder using explicit stream mapping.
- Define the execution interface between domain logic and process orchestration.
- Parse stderr/progress output into normalized job updates.
- Map process failures into structured UI-safe errors.

#### Deliverables

- Tested command builder.
- Process runner with normalized progress and error output.

### 3. Main Process And Preload APIs

#### Outcomes

- Renderer actions flow through explicit, validated native boundaries.

#### Tasks

- Add file-open and output-folder selection handlers.
- Add export-submission and progress-subscription APIs.
- Validate all incoming renderer payloads in the main process.
- Avoid raw IPC exposure through preload.

#### Deliverables

- Narrow bridge API with predictable contracts.

### 4. Renderer Workflow

#### Outcomes

- A user can complete the clipping workflow without leaving the app.

#### Tasks

- Build a single-video editor view with preview state, range list, and edit controls.
- Add range creation, modification, deletion, and validation messaging.
- Add output-folder and export-mode controls.
- Add a queue panel or screen showing pending, running, completed, and failed jobs.

#### Deliverables

- Usable MVP clipping interface.

### 5. Validation And Error Handling

#### Outcomes

- Early users can understand what happened during export.

#### Tasks

- Surface validation errors before exports start.
- Show actionable summaries on job failure.
- Provide minimal retry affordances if cheap to implement, otherwise document them for Phase 2.

#### Deliverables

- User-visible failure states that are better than raw stderr.

### 6. Early Arch Distribution

#### Outcomes

- Arch users can install the package set through AUR without waiting for later release hardening.

#### Tasks

- Stabilize the GitHub release artifact name, URL pattern, and checksum output used by the package.
- Prepare `cutrail`, `cutrail-bin`, and `cutrail-git` packaging files around the published release and rolling artifacts.
- Keep the AUR workflow separate from the GitHub release workflow so stable and rolling channels do not overlap.
- Validate that each package installs and launches on an Arch-based environment.

#### Deliverables

- Initial `cutrail`/`cutrail-bin`/`cutrail-git` package path.

## Recommended Execution Sequence

1. Build and test domain rules before renderer complexity grows.
2. Implement the fast-trim command builder and process runner.
3. Add main/preload APIs for file selection and export orchestration.
4. Build the editor and queue UI around the validated contracts.
5. Harden validation and error display with end-to-end checks.
6. Publish and verify the AUR package set once the artifact contract stops moving.

## Validation Checklist

- Domain tests cover range normalization and output naming.
- ffmpeg command tests cover the fast-trim happy path and common invalid inputs.
- A user can open one video, add multiple ranges, and export clips locally.
- Failed exports show normalized application errors.
- The published binary artifact is stable enough to back `cutrail-bin`.
- `cutrail-bin` installs and launches on an Arch-based system, and the AUR workflow can keep `cutrail` and `cutrail-git` in sync.

## Risks And Mitigations

- ffmpeg command behavior may vary by media/container shape.
  - Mitigation: use explicit stream mapping and structured tests.
- Timeline editing may expand into a full editor too early.
  - Mitigation: keep the UI focused on in/out range definition only.
- Fast trim may confuse users when cuts are not frame accurate.
  - Mitigation: message the tradeoff clearly and defer accurate mode expansion to Phase 3.
- AUR metadata may churn too quickly if the release artifact contract changes repeatedly.
  - Mitigation: lock artifact naming and checksum generation before pushing the first package update.

## Exit Criteria

- The app can produce multiple clips from one source video in a single export run.
- Core export logic is covered by tests and separated from UI concerns.
- The workflow is useful enough to demonstrate the product’s core value.
- The Arch package set exists with `cutrail-bin` as the first supported install path and `cutrail`/`cutrail-git` maintained alongside it.

## Agent Notes

- Do not widen scope into source libraries or persistence during this phase unless it unblocks the MVP directly.
- Prefer correctness and observability in the export pipeline over visual polish.
- Treat the AUR package set as release-adjacent work in this phase; keep the release-tagged packages and rolling package contracts aligned with the GitHub release workflow.