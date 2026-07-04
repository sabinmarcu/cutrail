# Phased Implementation Plan

## Purpose

This document turns the product vision, technical direction, and distribution strategy into a practical delivery roadmap for cutrail.

Agents and contributors should use this file as the primary implementation sequencing guide when choosing what to build next. The supporting documents remain authoritative for product intent, architecture constraints, and release strategy:

- `docs/vision-and-motivation.md` explains what the product is for and what to avoid in early versions.
- `docs/technical-background-and-plan.md` defines the preferred architecture and key technical constraints.
- `docs/distribution-and-publishing.md` defines packaging and release expectations.

Detailed phase references:

- `docs/phases/phase-0-foundation-validation.md`
- `docs/phases/phase-1-single-video-clipping-mvp.md`
- `docs/phases/phase-2-source-library-and-workflow-maturity.md`
- `docs/phases/phase-3-accuracy-presets-and-export-controls.md`
- `docs/phases/phase-4-distribution-readiness.md`
- `docs/phases/phase-5-platform-polish-and-expansion.md`

## Delivery Principles

- Keep the product narrow: fast, reliable clip extraction over broad editing features.
- Build the ffmpeg pipeline and timeline domain logic so they can be tested independently of Electron UI.
- Prefer end-to-end vertical slices over broad scaffolding with no usable workflow.
- Keep Linux-first packaging and runtime assumptions explicit from the start.
- Treat AI documentation and implementation planning as part of the product surface, not optional metadata.

## Phase 0: Foundation Validation

### Goal

Confirm that the repository can support the chosen Electron, React, Yarn PnP, and packaging direction before feature work starts.

### Outcomes

- Electron application scaffold is present and runnable.
- React renderer is wired through preload with strict Electron security defaults.
- Lint, basic test, and developer scripts exist and run consistently.
- Packaging feasibility is tested early against the Yarn PnP setup.
- A lightweight preview publishing path exists for iteration builds.

### Workstreams

#### App bootstrap

- Add Electron main, preload, and renderer entrypoints.
- Establish source layout for `src/main`, `src/preload`, `src/renderer`, `src/domain`, and `src/infra`.
- Add minimal application shell with one browser window and development startup flow.

#### Tooling baseline

- Add the minimum scripts for dev, build, lint, and test workflows.
- Decide on the packaging tool after a small proof-of-life build.
- Add the smallest practical automated test setup for unit and integration slices.

#### Risk retirement

- Verify that Electron packaging works with the current Yarn 4 strategy.
- Decide whether packaging stays PnP-native or needs a dedicated packaging mode.
- Record any ffmpeg runtime assumptions for local development.

#### Preview publishing

- Add the lightest useful CI baseline for lint and packaging validation.
- Add preview GitHub Releases once packaging proof-of-life exists.
- Treat AUR `cutrail-bin` as an early follow-up only after artifact naming and checksums stabilize.

### Exit criteria

- A developer can install dependencies, start the app, and run lint/tests locally.
- The app window opens through Electron with the intended security posture.
- A packaging spike has validated or rejected the initial distribution approach.
- Maintainers can surface preview builds without waiting for full distribution hardening.

## Phase 1: Single-Video Clipping MVP

### Goal

Ship the first useful version: open one video, define multiple ranges, and export clips in a batch.

### Outcomes

- Users can load a video through dialog or drag and drop.
- Users can define, edit, validate, and remove multiple clip ranges.
- Users can export all ranges with clear success and failure reporting.
- Fast trim mode works first, with explicit room for accurate trimming.
- The first Arch install path exists through `cutrail-bin`.

### Workstreams

#### Domain logic

- Build clip range types, normalization, overlap handling, and validation rules.
- Add deterministic output naming logic.
- Define export job state and error models.

#### ffmpeg integration

- Build a command builder for fast trim mode.
- Add process execution, stderr capture, and progress parsing.
- Return normalized job results for renderer consumption.

#### Renderer workflow

- Create a clip editor view with preview, in/out controls, and a visible range list.
- Add output folder selection and export mode controls.
- Create an export queue view for pending, running, completed, and failed jobs.

#### IPC and preload

- Expose only narrow methods for file selection, export submission, and progress updates.
- Validate all renderer-provided inputs in the main process.

#### Early Arch distribution

- Stabilize the published binary artifact contract used by downstream packaging.
- Publish `cutrail-bin` as the first AUR package for Arch users.
- Keep the package flow semi-manual until later release hardening.

### Exit criteria

- A user can produce multiple clips from a single source file in one session.
- Core domain utilities and ffmpeg command generation are covered by tests.
- Failures are visible and actionable instead of surfacing as raw process errors.
- Arch users can install the MVP through `cutrail-bin`.

## Phase 2: Source Library And Workflow Maturity

### Goal

Reduce repeated setup by turning the MVP into a practical daily-use workflow.

### Outcomes

- The app can scan and display a configured source folder.
- Users can move between library, editor, queue, and settings without losing context.
- State persistence supports recent items, default folders, and export preferences.

### Workstreams

#### Library management

- Add source folder configuration and scanning.
- Build searchable video listing with basic metadata display.
- Support direct navigation from library to clip editor.

#### State persistence

- Persist recent files, folders, defaults, and lightweight UI preferences.
- Restore the last meaningful working context on launch where safe.

#### Queue resilience

- Add retry handling and clearer failure categorization.
- Improve progress reporting and completed output discovery.

#### Timeline interaction

- Improve timeline selection UX for multiple ranges.
- Add guardrails for invalid or ambiguous range edits.

### Exit criteria

- A repeat user can point cutrail at a source folder and process clips with less manual setup.
- The app preserves enough state to feel stable without introducing hidden behavior.

## Phase 3: Accuracy, Presets, And Export Controls

### Goal

Expand export control without diluting the core clipping workflow.

### Outcomes

- Accurate trim mode is available with explicit UX tradeoff messaging.
- Export presets become structured rather than ad hoc.
- Users gain better control over output format behavior where it matters.

### Workstreams

#### Accurate trim support

- Add re-encode command paths and preset defaults.
- Surface speed versus accuracy tradeoffs clearly in the UI.
- Keep stream mapping deterministic across both export modes.

#### Preset system

- Define a minimal preset model for export behavior.
- Add defaults that cover the most common workflows without becoming a full transcoding suite.

#### Diagnostics and observability

- Improve surfaced error summaries and retry hints.
- Add structured logging useful for development and support.

### Exit criteria

- Users can intentionally choose between fast and accurate clipping based on their needs.
- Export behavior remains predictable across common input variations.

## Phase 4: Distribution Readiness

### Goal

Turn the application into a releasable product for Linux-first users.

### Outcomes

- CI can lint, test, build, and package release artifacts.
- GitHub Releases can publish at least one Linux distribution artifact.
- AUR packaging is documented and maintainable.

### Workstreams

#### Packaging

- Finalize packaging tool configuration.
- Produce Linux artifacts, starting with AppImage.
- Validate runtime expectations around ffmpeg availability and documentation.

#### Release automation

- Add version-tag-driven GitHub Actions flow.
- Publish checksums and release artifacts.
- Define release checklist and rollback expectations.

#### Arch distribution

- Create `cutrail-bin` packaging first.
- Document checksum and metadata update workflow.
- Add source-based AUR packaging only after the build chain is stable.

### Exit criteria

- Maintainers can produce a repeatable Linux release from CI.
- The release path is documented well enough for continued maintenance.

## Phase 5: Platform Polish And Expansion

### Goal

Improve product quality and evaluate broader platform reach without destabilizing the core workflow.

### Outcomes

- UX friction around preview, export feedback, and recovery is reduced.
- Optional platform expansion work is scoped from a stable release base.
- Performance tuning and hardware acceleration can be introduced intentionally.

### Candidate work

- Hardware acceleration presets where they materially help export workflows.
- Windows and macOS packaging evaluation.
- Auto-update strategy for non-AUR installations.
- Accessibility, keyboard flow, and interface polish improvements.

### Exit criteria

- Additional platform or performance work is built on a stable release process and proven user workflow.

## Suggested Near-Term Execution Order

1. Prove Electron scaffold, test setup, packaging compatibility, and preview publishing feasibility.
2. Build domain logic and ffmpeg command generation before rich UI work.
3. Deliver the single-video multi-range export workflow end to end.
4. Add library and persistence only after the MVP workflow is stable.
5. Add accurate trimming and presets after fast trim mode is trustworthy.
6. Harden release automation and Linux distribution once the product loop is reliable.

## Agent Usage Notes

When an agent plans or executes work for this repository, it should:

- Start with this file to choose the current phase and adjacent milestone.
- Move next to the matching `docs/phases/` file for detailed workstreams, validation, and exit criteria.
- Use `docs/technical-background-and-plan.md` to keep implementation boundaries correct.
- Use `docs/vision-and-motivation.md` to reject scope creep into full editing features.
- Use `docs/distribution-and-publishing.md` when making build, packaging, or release decisions.
- Update this file when implementation sequencing materially changes.