# cutrail

Repository: `cutrail`

## Purpose

cutrail is a desktop utility focused on clipping segments from longer videos with a clean, maintainable architecture.

The project is beyond the original early Phase 1 state: the core single-video clipping workflow is in place, accurate trim support exists, and release/updater groundwork has started, but the Phase 2 library/persistence work and the remaining Phase 3 preset/diagnostic work are still incomplete.

Product name: **cutrail**.

Project planning documents:
- [Vision and motivation](docs/vision-and-motivation.md)
- [Technical background and implementation plan](docs/technical-background-and-plan.md)
- [Distribution and publishing plan](docs/distribution-and-publishing.md)
- [Build from source guide](BUILD.md)
- [Phased implementation plan](docs/phased-implementation-plan.md)
- [Publishing access and manual steps](docs/publishing-access-and-manual-steps.md)
- [Release and update research](docs/release-and-update-research.md)
- [AUR packaging](docs/aur-packaging.md)
- [Styling guide](docs/styling-guide.md)
- Detailed phase plans live under `docs/phases/`.

## Usage And How It Works

At this stage, usage is centered on a focused single-video clipping workflow while continuing active development.

How it currently functions:

1. Tooling is version-pinned through `.prototools` (`node ~22`, `yarn ~4`) for reproducible environments.
2. Toolchain execution policy is proto-first: use `proto` for Node/Yarn resolution and do not use `corepack`.
3. Package management uses Yarn Berry with the `node-modules` linker for Electron compatibility.
4. Electron main and preload source code lives under `src/main` and `src/preload`, with runtime entry resolved from compiled output at `dist/electron/main/main.js`.
5. Renderer source is TypeScript-first (`.ts` / `.tsx`) with alias imports (`@renderer/*`, `@assets/*`).
6. Electron `.mjs` modules are JavaScript with `// @ts-check` and explicit JSDoc types for exported APIs.
7. Runtime stack uses:
	- Electron main process entrypoint under `src/main`
	- Preload bridge under `src/preload`
	- React renderer under `src/renderer` with a splash entry window (`app`), an editor workflow window (`editor`), and separate utility windows (for example About/Options/Diagnostics/Licenses)
	- Renderer imports use path aliases like `@renderer/*` and `@assets/*` instead of deep relative paths
	- Renderer-managed window chrome with shared minimize, maximize, and close controls on non-splash windows
	- editor clipping state/logic under `src/renderer/core/clipping` using Context API
	- editor-only timeline UI modules under `src/renderer/windows/editor/components/TimelineEditor`
	- grouped core feature files and barrel exports for renderer core modules
8. Styling architecture:
	- `vanilla-extract` for component-scoped styles
	- `@sabinmarcu/theme` as the primary token source for colors and spacing
	- shared renderer window patterns should be implemented as shared wrapper components with co-located styles
	- reusable primitives (for example generic buttons) should live in shared renderer component modules
9. Video processing runtime behavior:
	- The app resolves ffmpeg from a bundled binary via `@ffmpeg-installer/ffmpeg` when available.
	- If an explicit path is needed, set `CUTRAIL_FFMPEG_PATH`.
	- If neither bundled nor override paths are available, the app falls back to system `ffmpeg` on PATH.
	- ffmpeg attribution and licensing notes are documented in `THIRD_PARTY_NOTICES.md`.
10. Code quality is enforced through ESLint flat config, TypeScript checks, and pre-commit checks:
	- `yarn lint`
	- `yarn lint:fix`
	- `yarn lint:staged`
	- `yarn typecheck:renderer`
	- `yarn typecheck:electron-jsdoc`
	- Workflow policy: run `yarn lint:fix` before strict checks, then run `yarn lint` and `yarn typecheck`; manually fix only issues that remain after autofix.
11. Tests run with Vitest:
	- `yarn test`
12. Commit messages are enforced with Commitlint using the Conventional Commits spec.
13. Husky runs:
	- `pre-commit` -> `yarn lint:staged`
	- `commit-msg` -> `yarn commitlint --edit`
14. AI-assisted development is configured through:
	- `README.md` (human-oriented project documentation)
	- `.github/copilot-instructions.md`
	- `.github/instructions/styling-guide.instructions.md`
	- `.github/instructions/renderer-architecture.instructions.md`
	- `.github/instructions/core-modules.instructions.md`
	- `AGENTS.md`
	- `SKILLS.md`
	- `docs/styling-guide.md` (hard rules for renderer/component styling and structure)

Current workflow boundaries:
- Source video selection is triggered from File menu actions and splash-entry actions.
- Each selected source video opens its own independent editor window.
- Editor windows focus on timeline editing and export only.
- Output directory management is configured in the Options utility window.
- Shared button primitive lives under `src/renderer/components/button`.
- AUR packaging skeleton for `cutrail-bin` now lives under `packaging/aur/cutrail-bin`.
- AUR packaging skeletons for `cutrail`, `cutrail-bin`, and `cutrail-git` now live under `packaging/aur/`.

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
- `yarn lint`
- `yarn lint:fix`
- `yarn test`
- `yarn verify:ffmpeg`
- `yarn dev`
- `yarn commitlint --help`

### Environment Variables

The application supports the following runtime environment variables:

1. `CUTRAIL_FFMPEG_PATH`
- Purpose: Overrides ffmpeg binary resolution with an explicit executable path.
- Default: unset (bundled ffmpeg first, then system PATH fallback).
- Example:
	- `CUTRAIL_FFMPEG_PATH=/usr/bin/ffmpeg yarn dev`

2. `CUTRAIL_OPEN_DEVTOOLS`
- Purpose: Opens Electron DevTools automatically when windows are created.
- Enabled values: `1`, `true`, `yes`, `on` (case-insensitive).
- Default: unset or any other value (DevTools do not auto-open).
- Example:
	- `CUTRAIL_OPEN_DEVTOOLS=1 yarn dev`

3. `VITE_DEV_SERVER_URL`
- Purpose: In development mode, points Electron windows to an explicit renderer dev-server URL.
- Expected value: a valid absolute URL.
- Default: unset (production load path is used, or scripts provide this in dev).
- Example:
	- `VITE_DEV_SERVER_URL=http://localhost:5173 yarn dev:electron`

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
- `yarn lint` for strict static validation.
- `yarn lint:fix` for autofixable issues.
- `yarn test` to run unit tests with Vitest.

## Releases

- Stable versioning and changelog generation are managed by `.github/workflows/release-please.yml`.
- Release Please opens a release PR that updates `package.json` and `CHANGELOG.md`, then creates the stable tag and GitHub Release after merge.
- `.github/workflows/release.yml` remains tag-driven and builds cross-platform artifacts for tags like `v0.1.0`.
- The release workflow uploads artifacts to the existing GitHub Release for that tag (it does not recreate the release body).
- Release assets include Linux AppImage/deb/rpm, macOS dmg, and Windows nsis `.exe` installer.
- Release jobs also publish updater metadata artifacts (`latest.yml`, `latest-mac.yml`, `latest-linux.yml`) used by in-app update checks.
- In-app self-update checks are enabled for packaged GitHub-release installs; on Linux, self-update applies only to AppImage installs.
- AUR/system package installs should remain package-manager updated and should not self-update from inside the app.

## AUR Packages

AUR package definitions are kept in this repository, but automated publishing is temporarily disabled while AUR registrations are closed.

The previous workflow was renamed to [`.github/workflows/aur-packages.yml.disabled`](.github/workflows/aur-packages.yml.disabled) so it can be restored quickly later.

When enabled again, the flow publishes these Arch packages:

- `cutrail` for source-built release installs
- `cutrail-bin` for prebuilt release installs
- `cutrail-git` for the rolling `master` branch

`cutrail-bin` requires `fuse2` on Arch because it installs the upstream AppImage directly. Local test steps live in [docs/aur-packaging.md](docs/aur-packaging.md).

## License And Contributing

- License: `LICENSE`
	- MIT License.
- Third-party notices: `THIRD_PARTY_NOTICES.md`
	- Includes FFmpeg attribution and bundled-binary licensing notes.
- Contribution guide: `CONTRIBUTING.md`
