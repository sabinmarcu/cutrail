# Phase 4: Distribution Readiness

## Intent

Phase 4 converts an early publishing path into a maintainable release pipeline. By the end of this phase, cutrail should be publishable for Linux-first users with a hardened and documented path for GitHub Releases and AUR distribution.

## Primary Goals

- Finalize packaging configuration.
- Harden CI-driven release automation that may have started in Phase 0.
- Produce maintainable Linux distribution artifacts.
- Establish the stable changelog and update strategy for released binaries.

## Scope

### In scope

- Release packaging configuration.
- Hardened GitHub Actions build and publish flow.
- Linux artifacts, beginning with AppImage.
- AUR packaging documentation and stable package maintenance path.

### Out of scope

- Full auto-update infrastructure unless it is necessary for chosen packaging.
- Broad multi-platform polishing.

## Dependencies And Inputs

- Packaging direction chosen in Phase 0.
- Product workflow stable enough to justify versioned releases.
- Distribution guidance from `docs/distribution-and-publishing.md`.

## Workstreams

### 1. Packaging Finalization

#### Outcomes

- The chosen packaging tool is configured for repeatable builds.

#### Tasks

- Finalize packaging configuration in the repository.
- Produce Linux build artifacts in a local or CI-safe flow.
- Confirm runtime expectations around ffmpeg and any external dependencies.
- Document artifact formats and any installation caveats.

#### Deliverables

- Reliable packaging configuration.

### 2. Release Automation Hardening

#### Outcomes

- Tagged releases can build and publish artifacts consistently, building on the preview path introduced earlier.

#### Tasks

- Extend or harden GitHub Actions workflows for lint, test, build, and release publish.
- Use the chosen Conventional-Commit release engine to keep `CHANGELOG.md` and GitHub Release notes in sync.
- Publish artifacts and checksums.
- Add versioning and release checklist guidance.
- Define how failures are handled or rolled back.

#### Deliverables

- Hardened CI release pipeline.

### 3. Arch Distribution

#### Outcomes

- Arch users have a documented and maintainable package path.

#### Tasks

- Promote `cutrail-bin` from an early/manual path into a documented and maintainable flow.
- Document release-asset checksum updates and `.SRCINFO` expectations.
- Add source-build packaging only if the build chain is stable enough.

#### Deliverables

- AUR package strategy and packaging artifacts.

### 4. Release Documentation

#### Outcomes

- Maintainers can publish without reconstructing tribal knowledge.

#### Tasks

- Update README and planning docs to reflect the release flow.
- Capture artifact expectations, prerequisites, and manual checks.

#### Deliverables

- Current release and distribution documentation.

### 5. Binary Update Strategy

#### Outcomes

- GitHub-release-installed binaries have a clear update path that does not require manual re-download.
- AUR-installed packages do not fight the system package manager.

#### Tasks

- Prototype or implement the preferred updater path for packaged GitHub-release builds.
- Gate self-updates so they are enabled only for installation modes that should manage themselves.
- Disable or bypass in-app self-update for AUR-managed installs.
- Document the release artifact and metadata expectations required by the updater path.

#### Deliverables

- Documented updater policy.
- Implemented or validated updater path for GitHub-release-installed binaries.

## Recommended Execution Sequence

1. Finalize packaging config from the already-proven Phase 0 direction.
2. Harden CI build/test/publish workflows.
3. Produce stable release artifacts, changelog output, and checksums.
4. Formalize the AUR package path around `cutrail-bin` first.
5. Implement or validate the updater policy for GitHub-release-installed binaries.
6. Tighten maintainer docs after the first end-to-end dry run.

## Validation Checklist

- CI can lint, test, and package the app.
- A tagged release can produce Linux artifacts.
- Stable releases include generated changelog content in both `CHANGELOG.md` and the GitHub Release body.
- Artifact installation and startup expectations are documented.
- AUR metadata workflow is captured accurately.
- Updater behavior is documented separately for GitHub Releases installs and AUR installs.

## Risks And Mitigations

- Packaging may still hide environment-specific failures.
  - Mitigation: validate in CI and on at least one target Linux environment.
- Release automation may drift from actual maintainer steps.
  - Mitigation: document the process immediately after the first successful run.
- AUR metadata can fall out of sync.
  - Mitigation: treat `.SRCINFO` regeneration as part of the release checklist.

## Exit Criteria

- Maintainers can produce a repeatable Linux release with documented steps and CI support.
- The first packaging and distribution path is maintainable, not experimental.

## Agent Notes

- Keep release automation boring and explicit.
- If packaging constraints force a tooling change, update all AI docs and planning docs in the same change.