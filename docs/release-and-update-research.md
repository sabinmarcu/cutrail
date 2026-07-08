# Release And Update Research

## Purpose

This document captures the current research-backed options for:

- creating releases from Conventional Commits
- generating and preserving changelogs
- ensuring changelog content is included in GitHub Releases
- supporting in-app updates for packaged Electron builds

It is intended to guide implementation decisions in Phase 0 and Phase 4.

## Current Repository Status

- Stable versioning/changelog/release-note generation is now wired through Release Please.
- Tag-driven packaging remains in `.github/workflows/release.yml` and attaches artifacts to the existing GitHub Release for the tag.
- AUR automation remains disabled, but its parked workflow keeps release-driven update wiring for later re-enable.

## Recommended Implementation For This Repository

Unless later repository constraints force a change, the release and update stack for cutrail should be:

1. Commitlint plus Conventional Commits for input discipline.
2. Release Please for stable versioning, `CHANGELOG.md` generation, release PRs, tags, and GitHub Releases.
3. A separate GitHub Actions packaging workflow that attaches release artifacts to the GitHub Release created by Release Please.
4. Preview-release workflows kept separate from stable release automation.
5. `electron-builder` packaging plus `electron-updater` for GitHub-release-installed binaries.
6. No in-app updater for AUR-installed builds.

This is the default plan the repository should follow until a concrete implementation constraint disproves it.

## Release Automation Options

### Option A: Release Please

#### What it does well

- Uses Conventional Commits as its input model.
- Opens a release PR instead of publishing immediately on every merge.
- Updates `CHANGELOG.md`.
- Bumps version files such as `package.json`.
- Tags the release commit and creates a GitHub Release when the release PR is merged.
- Fits GitHub-hosted repositories particularly well.

#### Tradeoffs

- Does not publish package-manager artifacts by itself.
- Works best when the repository uses squash merges or otherwise keeps main-branch history clean.
- Needs a second workflow step to build Electron artifacts and attach them to the created GitHub Release.

#### Fit for cutrail

Strong fit.

cutrail already enforces Conventional Commits, uses GitHub, and benefits from a reviewable release step. Release Please is the best match when you want changelog generation, versioning, and GitHub Releases without turning every merge into an irreversible publish event.

### Option B: semantic-release

#### What it does well

- Fully automates versioning, release note generation, tagging, and publishing from CI.
- Works directly from Conventional Commits.
- Can publish on every successful merge to a release branch.
- Good fit when zero-touch stable releases are the goal.

#### Tradeoffs

- More opaque operationally than a release PR flow.
- Usually better once the release process is already trusted and stable.
- The docs page originally queried is discontinued in favor of `semantic-release.org`, which is a mild documentation friction point rather than a product issue.

#### Fit for cutrail

Reasonable later-stage option, but not the best initial fit.

It is stronger when the project is ready for fully automated stable releases. cutrail is still deciding packaging, publishing, and updater policy, so the release PR model is safer for now.

### Option C: commit-and-tag-version

#### What it does well

- Local, maintainer-driven version bumping and changelog generation.
- Forked from the deprecated `standard-version` tool.
- Updates `CHANGELOG.md`, creates a release commit, and tags locally.
- Useful when you want explicit local control before pushing tags.

#### Tradeoffs

- Does not create GitHub Releases or publish artifacts by itself.
- More manual than the GitHub-native alternatives.
- Best viewed as a fallback if the repository intentionally avoids GitHub-native release automation.

#### Fit for cutrail

Acceptable fallback, not the primary recommendation.

It is better than deprecated `standard-version`, but it solves less of the end-to-end workflow than Release Please.

## Recommendation For cutrail

### Preferred stable-release approach

Use Release Please for stable releases and changelog generation.

Recommended shape:

1. Conventional Commits remain enforced with Commitlint.
2. Release Please maintains `CHANGELOG.md`, proposes version bumps, and creates the GitHub Release.
3. A packaging workflow builds Electron artifacts and attaches them to the GitHub Release.
4. The GitHub Release body is treated as release notes derived from the same commit history as the changelog.

Recommended stable workflow split:

- Workflow A: Release Please watches the default branch and maintains the release PR.
- Workflow B: When a Release Please merge produces a release tag or published GitHub Release, packaging builds the Electron artifacts and uploads them to that release.

This keeps changelog/version decisions separate from packaging concerns.

### Preferred preview-release approach

Keep preview builds separate from stable release automation.

Recommended shape:

- Phase 0 preview builds can use prerelease tags or manual-dispatch GitHub Actions workflows.
- Preview releases do not need full version-changelog ceremony.
- Stable semver release management begins once the packaging contract is reliable.

This keeps iteration fast without overfitting early preview builds into the long-term stable release workflow.

## Changelog Policy

The changelog should exist in two places for each stable release:

1. `CHANGELOG.md` committed in the repository.
2. GitHub Release notes/body attached to the release.

Policy recommendation:

- The changelog file is the durable in-repo record.
- The GitHub Release body is the user-facing release note snapshot.
- The release workflow should fail if the release is missing generated notes or the changelog update.

For cutrail, Release Please is the cleanest way to make both happen from the same Conventional Commit history.

### Mandatory changelog rules

- Every stable release must update `CHANGELOG.md`.
- Every stable GitHub Release must contain generated release notes.
- Preview releases may use lightweight notes, but should still identify the commit or tag they were built from.
- Release automation should fail rather than publish a stable release with missing notes.

## Electron Update Options

## Option A: `update.electronjs.org` plus `update-electron-app`

### What it does well

- Very low setup cost.
- Uses GitHub Releases as the update source.
- Automatically downloads updates in the background and prompts the user to restart.
- Good for open-source apps hosted publicly on GitHub.

### Hard limits

- Officially intended for macOS and Windows only.
- Requires a public GitHub repository.
- Requires specific asset formats and naming conventions.
- Not a good fit for Linux-first update needs.

### Fit for cutrail

Not sufficient as the primary updater strategy.

It is attractive for future macOS and Windows builds, but it does not solve the Linux-first requirement.

## Option B: `electron-builder` plus `electron-updater`

### What it does well

- Supports auto-update across macOS, Windows, and Linux.
- The documented supported Linux targets include AppImage, rpm, and deb.
- Designed to work with simple file hosting rather than requiring a complex custom server.
- Fits the Electron packaging and publishing workflow well.

### Tradeoffs

- Packaging and updater metadata need to be correct and stable.
- `electron-builder` expects `node_modules` for packaging; this repo aligns by using Yarn with `nodeLinker: node-modules`.
- It is more operationally involved than `update-electron-app`.

### Fit for cutrail

Best fit for GitHub-release-installed builds.

Because cutrail is Linux-first and wants an update path that does not require manual re-downloads, `electron-updater` is the strongest option to carry forward in planning.

## Option C: Custom update service

Examples called out in Electron’s official docs include Hazel, Nuts, Nucleus, and electron-release-server.

### What it does well

- Supports private releases, authentication, channels, staged rollout, or custom hosting logic.
- Gives maximum flexibility later.

### Tradeoffs

- Highest operational cost.
- Not necessary for the first usable distribution flow.

### Fit for cutrail

Do not start here.

This should be considered only if GitHub Releases plus the chosen updater path becomes too limiting.

## Installation-Method Update Policy

cutrail should not use one updater policy for every distribution path.

### GitHub Releases install

- In-app self-update is appropriate.
- The app can download updates in the background and prompt for restart.
- This is the place where `electron-updater` should eventually be enabled.

### AUR install

- In-app self-update should be disabled.
- Updates should flow through the system package manager and the AUR package update path.
- The app may surface that updates are managed externally, but should not bypass pacman/AUR with its own binary updater.

This separation avoids conflicts between application-managed updates and system-managed package ownership.

### Detection policy to implement later

When the updater is added, the app should make an explicit runtime choice:

- If installed from GitHub-release-provided binaries, self-update may be enabled.
- If installed from AUR or another system package manager path, self-update should be disabled.

The implementation details can vary, but the behavioral policy should not.

## Concrete Adoption Plan

### Stable releases

- Adopt Release Please.
- Keep `CHANGELOG.md` in the repository root.
- Let Release Please own stable version bumps and stable GitHub Release creation.
- Ensure packaging workflows attach AppImage first, then additional formats later if needed.

### Preview releases

- Use manual-dispatch or prerelease-tag workflows.
- Do not require preview builds to pass through the stable release PR flow.
- Keep preview artifact naming distinct from stable releases when practical.

### Updater rollout

- Initial updater behavior is now implemented for packaged GitHub-release installs using `electron-updater`.
- Keep Linux self-update behavior AppImage-only.
- Continue hardening release artifact stability before expanding updater UX.
- Keep AUR outside the updater path permanently.

## What This Research Does Not Yet Decide

The research narrows the stack, but it does not yet finalize:

- the exact `release-please` configuration file shape
- the exact workflow trigger names and file names
- the final artifact names for AppImage and any later package formats
- the runtime mechanism used to determine whether the app is AUR-installed or GitHub-release-installed

Those should be resolved during implementation, not by reopening the higher-level tool choice.

## Planning Implications

### Phase 0

- Choose the stable release automation direction.
- Recommendation: adopt Release Please for stable releases.
- Separate preview publishing from stable semver automation.
- Capture the updater policy split between GitHub Releases installs and AUR installs.

### Phase 1

- Publish `cutrail-bin` once artifact naming and checksums stabilize.
- Keep AUR updates package-manager-driven, not app-driven.

### Phase 4

- Harden Release Please plus packaging workflow into the stable release path.
- Ensure `CHANGELOG.md` and GitHub Release notes are generated from the same Conventional Commit history.
- Harden and validate `electron-updater` behavior for GitHub-release-installed builds.
- Ensure the app disables self-updates when distributed through AUR.

### Phase 5

- Add richer update channels or staged rollout only if needed.
- Consider `update.electronjs.org` for future macOS/Windows builds if the repository remains public and that path stays attractive.

## Final Recommendation

- Use Release Please as the primary stable release and changelog engine.
- Keep preview releases as a separate lightweight workflow.
- Treat changelog inclusion in GitHub Releases as mandatory.
- Use `electron-builder` plus `electron-updater` as the long-term updater path for GitHub-release-installed binaries.
- Do not self-update AUR installations from inside the app.
- Keep the release PR flow and the packaging flow separate, but connected through the resulting GitHub Release.