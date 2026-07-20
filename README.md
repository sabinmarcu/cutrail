# cutrail

Repository: `cutrail`

## Purpose

cutrail is a desktop utility focused on clipping segments from longer videos with a clean, maintainable architecture.

The project has moved beyond the initial Phase 1 scaffold: the core single-video clipping workflow is in place, accurate trim support exists, and release/update groundwork has started, while library/persistence and broader preset/diagnostic work remain in progress.

Product name: **cutrail**.

Project planning and reference docs live in the repository docs tree. Start with the roadmap, then follow the supporting architecture, distribution, and style guides as needed:

- [Phased implementation plan](docs/phased-implementation-plan.md)
- [Technical background and plan](docs/technical-background-and-plan.md)
- [Distribution and publishing](docs/distribution-and-publishing.md)
- [Build from source](BUILD.md)
- [Styling guide](docs/styling-guide.md)
- [Phase details](docs/phases/)

## Usage And How It Works

At this stage, usage is centered on a focused single-video clipping workflow while continuing active development.

How it currently functions:

1. Tooling is pinned through `.prototools` so local Node and Yarn versions stay consistent across environments.
2. Toolchain execution is proto-first: use `proto` for Node/Yarn resolution and avoid `corepack`.
3. Package management uses Yarn 4 with the `node-modules` linker for Electron compatibility.
4. Electron main and preload source code lives under `src/main` and `src/preload`, with runtime entry resolved from compiled output in `dist/electron/main`.
5. Renderer source is TypeScript-first (`.ts` / `.tsx`) and uses alias imports such as `@renderer/*` and `@assets/*`.
6. Electron `.mjs` modules stay JavaScript-based with `// @ts-check` and explicit JSDoc types for exported APIs.
7. Runtime stack includes the Electron main process, the preload bridge, the React renderer, shared window chrome for non-splash windows, and editor-focused clipping logic under `src/renderer/core/clipping`.
8. Styling uses `vanilla-extract` with `@sabinmarcu/theme` tokens, plus shared renderer components for reusable window patterns and controls.
9. Video processing resolves ffmpeg from the bundled binary first, then from an explicit override, and finally from system `ffmpeg` on PATH.
10. Code quality is enforced through ESLint, TypeScript checks, Vitest, and Husky/Commitlint hooks.
11. Desktop packaging declares OS file associations for supported video extensions so files can be opened with Cutrail from the system file manager.
12. Main-process startup integrates OS file-open entrypoints and opens supported files directly in editor windows.

Current workflow boundaries:
- Source video selection is triggered from File menu actions and splash-entry actions.
- Each selected source video opens its own independent editor window.
- Editor windows focus on timeline editing and export only.
- Output directory management is configured in the Options utility window.
- Shared button primitive lives under `src/renderer/components/Button`.
- AUR packaging skeleton for `cutrail-bin` now lives under `packaging/aur/cutrail-bin`.
- AUR packaging skeletons for `cutrail`, `cutrail-bin`, and `cutrail-git` now live under `packaging/aur/`.

Metadata-first clip behavior:

- Clip detection in output directories is metadata-first.
- Clips are classified as `metadata`, `legacy`, `foreign`, or `invalid`.
- Legacy filename parsing remains as a fallback for older exports without metadata.
- Re-exporting legacy clips creates metadata-enabled outputs.
- Clip identity matching is based on metadata keys (source fingerprint, range key, variant key) when present.

Watcher behavior:

- Source and output watchers publish canonical snapshot channels:
	- `cutrail:source-directory-snapshot-updated`
	- `cutrail:output-directory-snapshot-updated`
	- `cutrail:watcher-health-updated`
- Snapshot payloads include `snapshotRevision` and renderer consumers ignore stale revisions.
- Snapshot payloads include `changeSummary` counters (`added`, `changed`, `removed`) derived from previous snapshots.
- Source snapshot entries expose `hasMetadataClips` and `hasLegacyClips` flags for library/diagnostics surfacing.
- Runtime contract validation is Zod-based; JSON Schema is not used in this rollout.

Known limitation:

- External tools that remux or rewrite containers can strip metadata tags, causing clip classification to fall back to `legacy` or `foreign` detection.

Main architecture boundaries:
- IPC handlers are split one-per-file under `src/main/ipc/handlers`.
- Main-process window modules are grouped under `src/main/windows`.

## Startup Guide (Build From Source)

### Prerequisites

1. Linux/macOS/Windows development environment
2. `proto` installed (recommended for pinned toolchain)
3. Git

Node runtime note:
- Electron development is currently validated against Node 22 LTS in this repository.
- Using newer major Node versions (for example Node 26) can break Electron binary installation.

### Clone

1. Clone repository:
	- `git clone <repository-url>`
2. Enter project directory:
	- `cd cutrail`

### Install Toolchain

1. Install Node and Yarn from `.prototools`:
	- `proto install node`
	- `proto install yarn`

### Install Dependencies

1. Install project dependencies:
	- `yarn install`

### Verify Source Build

Current bootstrap verification commands:
- `yarn lint:fix`
- `yarn typecheck`
- `yarn lint` (strict verification, when needed)
- `yarn test`
- `yarn verify:ffmpeg`
- `yarn dev`
- `yarn commitlint --help`

Git hooks run staged lint, full `lint`, `typecheck`, and `test` checks before commit, along with the AUR metadata sync guard before push.

### Environment Variables

The application supports the following runtime environment variables:

1. `CUTRAIL_FFMPEG_PATH`
- Purpose: Overrides ffmpeg binary resolution with an explicit executable path.
- Default: unset (bundled ffmpeg first, then system PATH fallback).
- Example: set it only when you need to point Cutrail at a specific ffmpeg binary.

2. `CUTRAIL_OPEN_DEVTOOLS`
- Purpose: Opens Electron DevTools automatically when windows are created.
- Enabled values: `1`, `true`, `yes`, `on` (case-insensitive).
- Default: unset or any other value (DevTools do not auto-open).
- Example:
	- `CUTRAIL_OPEN_DEVTOOLS=1 yarn dev`

3. `VITE_DEV_SERVER_URL`
- Purpose: In development mode, points Electron windows to an explicit renderer dev-server URL.
- Expected value: a valid absolute URL.
- Default: unset; the development scripts usually provide this automatically.
- Example: override it only when you need to point Electron at a custom renderer server.

### Commit Message Convention

This repository uses Conventional Commits and validates commit messages with Commitlint.

Common examples:

- `feat: add export queue shell`
- `fix: handle invalid clip ranges`
- `docs: update publishing workflow`
- `chore: add commitlint hook`

Use a short imperative summary after the type. Keep each commit focused on one concern when possible.

### Current Status

- The Phase 1 desktop workflow is runnable through Electron with timeline-based range editing and batch export.
- Fast and accurate trim modes are available in the editor workflow.
- Diagnostics, options, licenses, about, and update utility windows exist.
- Release automation and updater groundwork exist, but that should be treated as partial Phase 4 progress rather than a finished release-readiness state.
- Source-library scanning, recent-context persistence, and a structured preset model are not implemented yet.
- Core source layout now exists:
	- `src/main`
	- `src/preload`
	- `src/renderer`
	- `src/domain`
	- `src/infra`
- Main clipping UI now embeds video playback and a synchronized interactive timeline.
- About and license details are presented in separate Electron utility windows.
- The next milestones are documented in:
  - [docs/technical-background-and-plan.md](docs/technical-background-and-plan.md)
	- [docs/phased-implementation-plan.md](docs/phased-implementation-plan.md)
	- `docs/phases/`

## Install And Build

### Install

1. Ensure `proto` is installed (recommended for matching pinned versions).
2. Install toolchain versions:
	- `proto install node`
	- `proto install yarn`
3. Install project dependencies:
	- `yarn install`

### Build

Current available commands:

- `yarn dev` to run Vite renderer + node-runtime TypeScript watch + Electron together.
- `yarn build:node` to compile Electron/runtime TypeScript into `dist/electron`.
- `yarn build:node:watch` to continuously compile Electron/runtime TypeScript into `dist/electron`.
- `yarn build` to build the renderer into `dist/renderer`.
- `yarn start` to build renderer + node runtime and run Electron from compiled entry.
- `yarn package` to create an unpacked Electron app bundle via `electron-builder`.
- `yarn dist` to create packaged distribution artifacts via `electron-builder`.
- `yarn dist:appimage` to build a Linux AppImage locally.
- `yarn lint:fix` as the default lint command (autofixes many issues).
- `yarn typecheck` as the preferred default validation command for code changes.
- `yarn lint` for strict lint verification when needed.
- `yarn build` when you specifically need to validate bundling output.
- `yarn test` to run unit tests with Vitest.

## Releases

- Stable versioning and changelog generation are managed by `.github/workflows/release-please.yml`.
- Release Please opens a release PR that updates `package.json` and `CHANGELOG.md`, then creates the stable tag and GitHub Release after merge.
- `.github/workflows/release.yml` remains tag-driven and builds cross-platform artifacts for tags like `vX.Y.Z`.
- The release workflow uploads artifacts to the matching GitHub Release for that tag.
- Release assets include Linux AppImage/deb/rpm, macOS dmg, and Windows nsis `.exe` installer.
- Release jobs also publish updater metadata artifacts (`latest.yml`, `latest-mac.yml`, `latest-linux.yml`) used by in-app update checks.
- In-app self-update checks are enabled for packaged GitHub-release installs; on Linux, self-update applies only to AppImage installs.
- AUR/system package installs should remain package-manager updated and should not self-update from inside the app.

## AUR Packages

AUR package definitions are kept in this repository and published by [`.github/workflows/aur-packages.yml`](.github/workflows/aur-packages.yml).

The workflow runs in two channels:

- stable channel (`cutrail` and `cutrail-bin`) after successful completion of `.github/workflows/release.yml`
- rolling channel (`cutrail-git`) on `main` pushes

Jobs run only when `AUR_SSH_PRIVATE_KEY` is configured in repository secrets.

The flow publishes these Arch packages:

- `cutrail` for source-built release installs
- `cutrail-bin` for prebuilt release installs
- `cutrail-git` for the rolling `main` branch

`cutrail-bin` requires `fuse2` on Arch because it installs the upstream AppImage directly. Local test steps live in [docs/aur-packaging.md](docs/aur-packaging.md).

## License And Contributing

- License: `LICENSE`
	- MIT License.
- Third-party notices: `THIRD_PARTY_NOTICES.md`
	- Includes FFmpeg attribution and bundled-binary licensing notes.
- Contribution guide: `CONTRIBUTING.md`
