# Phase 0: Foundation Validation

## Intent

Phase 0 proves that cutrail can be built on the intended desktop stack without carrying hidden platform or tooling risk into feature work.

The phase is complete when the repository can boot an Electron app, host a React renderer through a safe preload bridge, run a minimal test/lint loop, and demonstrate a credible packaging path under the current Yarn strategy.

It should also establish the lightest credible preview-publishing path so maintainers can share iteration builds without waiting for late-stage distribution hardening.

## Primary Goals

- Establish the Electron process model and source layout.
- Confirm the React renderer integration and preload bridge pattern.
- Add the minimum viable local developer workflow for run, build, lint, and test.
- Retire the highest-risk packaging unknowns early.
- Establish minimal preview CI and release automation once packaging proof-of-life exists.

## Scope

### In scope

- Electron main process bootstrap.
- Preload bridge with narrow typed APIs.
- React renderer application shell.
- Initial scripts and test harness selection.
- Packaging spike and release-tool choice.
- Preview GitHub release automation for iteration builds.

### Out of scope

- Real clipping workflows.
- Full application navigation.
- Queue management, persistence, or media-domain logic.
- Multi-platform release support beyond proving the packaging path.
- Full long-term distribution hardening and unattended AUR publishing.

## Dependencies And Inputs

- Product constraints from `docs/vision-and-motivation.md`.
- Architecture rules from `docs/technical-background-and-plan.md`.
- Packaging constraints from `docs/distribution-and-publishing.md`.

## Workstreams

### 1. Repository Structure And Runtime Bootstrap

#### Outcomes

- A clear `src` layout exists for main, preload, renderer, domain, and infra code.
- An Electron window opens successfully in development.

#### Tasks

- Create `src/main`, `src/preload`, `src/renderer`, `src/domain`, and `src/infra`.
- Add the Electron entrypoint and BrowserWindow configuration.
- Keep `contextIsolation: true`, `nodeIntegration: false`, and default web security enabled.
- Add a renderer root that can display a simple application shell.
- Define the initial preload API shape even if it only exposes one or two placeholder methods.

#### Deliverables

- Bootable desktop shell.
- Initial source tree that reflects the intended architecture.

### 2. Development Tooling Baseline

#### Outcomes

- Local development commands are obvious and reproducible.
- The repo can support quick iteration without inventing tooling later.

#### Tasks

- Add scripts for development start, renderer build, desktop build, lint, and test.
- Choose the lightest test runner that fits unit and integration coverage goals.
- Add one or two smoke tests to validate the harness.
- Ensure the scripts work cleanly under the pinned Node and Yarn versions.

#### Deliverables

- Runnable development scripts.
- Basic test setup with at least one passing check.

### 3. Packaging Feasibility Spike

#### Outcomes

- The team has a justified packaging-tool decision.
- Yarn PnP compatibility risk is explicitly accepted or mitigated.

#### Tasks

- Evaluate the most likely packaging tool against the current repository shape.
- Produce a proof-of-life package or build artifact.
- Document any packaging caveats around `node_modules`, unplugging, or alternate install modes.
- Decide whether packaging will be PnP-native or require a dedicated packaging configuration.

#### Deliverables

- Chosen packaging direction.
- Notes on how the repo will build release artifacts later.

### 4. Documentation Alignment

#### Outcomes

- Human and AI contributors can understand the chosen development path.

#### Tasks

- Update root docs when scripts, structure, or packaging direction change.
- Keep planning docs aligned with any phase-level sequencing changes discovered during the spike.

#### Deliverables

- Accurate project setup and planning references.

### 5. Preview CI And Publishing

#### Outcomes

- Maintainers can surface iteration builds early without committing to the full release pipeline yet.

#### Tasks

- Add the first GitHub Actions checks for lint and any minimal tests.
- Add a preview release workflow that can package and publish a Linux artifact after packaging proof-of-life succeeds.
- Prefer prereleases or clearly marked preview tags over stable release automation at this stage.
- Keep AUR out of the critical path until artifact naming, checksums, and install expectations stabilize.
- Document the manual maintainer steps that automation cannot perform.
- Research and choose the stable release engine for Conventional-Commit-driven changelog and GitHub release creation.
- Capture the updater policy split between GitHub-release-installed binaries and AUR-installed packages.

#### Deliverables

- Lightweight CI baseline.
- Preview GitHub Release path for iteration builds.
- Release automation and updater recommendation recorded in repository docs.

## Recommended Execution Sequence

1. Scaffold the source layout and Electron runtime.
2. Bring up the React renderer through preload.
3. Add scripts and the smallest useful test harness.
4. Run the packaging spike before starting feature work.
5. Add the lightest preview CI and GitHub Release flow that fits the proven packaging path.
6. Update docs with the final packaging and workflow decisions.

## Validation Checklist

- `yarn install` succeeds.
- A local dev command opens the desktop shell.
- Lint passes.
- At least one test command passes.
- A packaging proof-of-life command succeeds or fails with a documented blocker.
- A preview release path is documented, even if it is still prerelease-only.

## Risks And Mitigations

- Yarn PnP may conflict with the chosen packaging flow.
  - Mitigation: prove packaging now instead of during release hardening.
- Electron security defaults may be weakened during bootstrap.
  - Mitigation: enforce the security baseline before adding features.
- Tooling may expand too far before product work begins.
  - Mitigation: keep scripts and tests intentionally minimal.
- Early publishing may create pressure to support unstable artifacts as if they were releases.
  - Mitigation: publish only preview-tagged artifacts in this phase and defer stable distribution guarantees.

## Exit Criteria

- The app boots locally through Electron and renders a React shell.
- The repository exposes a stable run/lint/test workflow.
- Packaging direction is known well enough to proceed without major hidden risk.
- Maintainers have a minimally automated way to share preview builds.

## Agent Notes

- Prefer small vertical progress over broad scaffolding.
- If a tooling decision affects later phases, record it in the main phased plan and AI docs immediately.