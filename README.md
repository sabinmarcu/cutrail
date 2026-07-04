# cutrail

Repository: `video-trimmer`

## Purpose

cutrail is a desktop utility focused on clipping segments from longer videos with a clean, maintainable architecture.

The project is currently in Phase 0 (foundation validation), with an initial Electron + React runtime scaffold in place.

Product name: **cutrail**.

Project planning documents:
- [Vision and motivation](docs/vision-and-motivation.md)
- [Technical background and implementation plan](docs/technical-background-and-plan.md)
- [Distribution and publishing plan](docs/distribution-and-publishing.md)
- [Phased implementation plan](docs/phased-implementation-plan.md)
- [Publishing access and manual steps](docs/publishing-access-and-manual-steps.md)
- [Release and update research](docs/release-and-update-research.md)
- Detailed phase plans live under `docs/phases/`.

## Usage And How It Works

At this stage, usage is centered on developer workflow and foundation validation rather than end-user features.

How it currently functions:

1. Tooling is version-pinned through `.prototools` (`node ~26`, `yarn ~4`) for reproducible environments.
2. Package management uses Yarn Berry with Plug'n'Play (PnP), avoiding `node_modules` and using `.pnp.*` loader artifacts.
3. Runtime stack is bootstrapped with:
	- Electron main process entrypoint under `src/main`
	- Preload bridge under `src/preload`
	- React renderer under `src/renderer`
4. Code quality is enforced through ESLint flat config and pre-commit checks:
	- `yarn lint`
	- `yarn lint:fix`
	- `yarn lint:staged`
5. Tests run with Vitest:
	- `yarn test`
6. Commit messages are enforced with Commitlint using the Conventional Commits spec.
7. Husky runs:
	- `pre-commit` -> `yarn lint:staged`
	- `commit-msg` -> `yarn commitlint --edit`
8. AI-assisted development is configured through:
	- `README.md` (human-oriented project documentation)
	- `.github/copilot-instructions.md`
	- `AGENTS.md`
	- `SKILLS.md`

## Startup Guide (Build From Source)

### Prerequisites

1. Linux/macOS/Windows development environment
2. `proto` installed (recommended for pinned toolchain)
3. Git

### Clone

1. Clone repository:
	- `git clone <repository-url>`
2. Enter project directory:
	- `cd video-trimmer`

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
- `yarn dev`
- `yarn commitlint --help`

### Commit Message Convention

This repository uses Conventional Commits and validates commit messages with Commitlint.

Common examples:

- `feat: add export queue shell`
- `fix: handle invalid clip ranges`
- `docs: update publishing workflow`
- `chore: add commitlint hook`

Use a short imperative summary after the type. Keep each commit focused on one concern when possible.

### Current Status

- A Phase 0 desktop shell is scaffolded and runnable through Electron.
- Core source layout now exists:
	- `src/main`
	- `src/preload`
	- `src/renderer`
	- `src/domain`
	- `src/infra`
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

- `yarn dev` to run Vite renderer + Electron main process together.
- `yarn build` to build the renderer into `dist/renderer`.
- `yarn start` to run Electron against the local project entrypoint.
- `yarn lint` for strict static validation.
- `yarn lint:fix` for autofixable issues.
- `yarn test` to run unit tests with Vitest.

## License And Contributing

- License: `LICENSE`
	- MIT License.
- Contribution guide: `CONTRIBUTING.md`
