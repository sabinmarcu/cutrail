# Copilot Instructions for cutrail

This repository is initialized for AI-assisted development with GitHub Copilot.

## Project Context

- Project name: `cutrail`
- Repository name: `cutrail`
- Package manager: `yarn` (configured via `packageManager: yarn@4.17.0`)
- Current stage: Early Phase 1 single-video clipping MVP (interactive timeline editor + About utility window)

## Working Guidelines

- Keep changes small and focused.
- Preserve existing style and conventions when adding code.
- Follow `docs/styling-guide.md` as a hard requirement for renderer component structure and styling conventions.
- Follow `.github/instructions/styling-guide.instructions.md` and `.github/instructions/renderer-architecture.instructions.md` as hard requirements for renderer styling and structure.
- Follow `.github/instructions/core-modules.instructions.md` as a hard requirement for non-renderer module structure.
- Add or update tests when behavior changes.
- Prefer clear names and straightforward logic over clever abstractions.
- Avoid introducing dependencies unless there is a clear need.
- Keep AI documentation in sync with repository changes: update `README.md`, `.github/copilot-instructions.md`, `AGENTS.md`, and `SKILLS.md` whenever architecture, tooling, or style guidance changes.
- For discovery, planning, and task sequencing, reference:
	- `docs/vision-and-motivation.md`
	- `docs/technical-background-and-plan.md`
	- `docs/distribution-and-publishing.md`
	- `docs/phased-implementation-plan.md`
	- `docs/publishing-access-and-manual-steps.md`
	- `docs/release-and-update-research.md`
	- `docs/styling-guide.md`
	- `.github/instructions/styling-guide.instructions.md`
	- `.github/instructions/renderer-architecture.instructions.md`
	- `.github/instructions/core-modules.instructions.md`
	- `.github/instructions/release-flow.instructions.md`
- After selecting a phase from `docs/phased-implementation-plan.md`, use the corresponding file under `docs/phases/` for detailed milestones, validation, and scope boundaries.
- Treat `docs/phased-implementation-plan.md` as the primary roadmap for deciding implementation order and the current delivery phase.
- Use `docs/publishing-access-and-manual-steps.md` whenever release automation touches GitHub permissions, AUR setup, or other maintainer-only actions.
- Use `docs/release-and-update-research.md` when choosing release tooling, changelog policy, or Electron update strategy.
- Use `docs/styling-guide.md` for renderer file structure, child component naming, style co-location, and style-sharing policy.
- Use `.github/instructions/styling-guide.instructions.md` for enforceable renderer styling rules.
- Use `.github/instructions/renderer-architecture.instructions.md` for enforceable renderer window/component layout rules.
- Use `.github/instructions/core-modules.instructions.md` for enforceable non-renderer module boundaries and file sizing rules.
- Use `.github/instructions/release-flow.instructions.md` for release automation, SemVer tagging, and packaging-channel policy.
- `@sabinmarcu/*` package documentation source is https://github.com/sabinmarcu/omnirepo.
- For local machine overrides of external docs/paths, read `AI_LOCAL_OVERRIDES.md` at repository root when present.
- Toolchain policy: always use `proto` for Node/Yarn tool resolution; never use `corepack`.
- User-facing documentation command style policy: when writing docs intended for users (for example `README.md`, `BUILD.md`, `CONTRIBUTING.md`), use direct script commands like `yarn lint` instead of `proto run yarn -- lint`.
- Lint policy: `eslint.config.mjs` must extend `@sabinmarcu/eslint-config` as the baseline shared flat config.
- Lint workflow policy: run `proto run yarn -- lint:fix` before running strict checks (`proto run yarn -- lint`, `proto run yarn -- typecheck`), and only apply manual code fixes for issues that remain after autofix.
- Temporary-file policy: use `logs/` for local temporary outputs and artifacts instead of writing temporary files elsewhere in the repository.
- Command redirection policy: when capturing command output with shell redirection (`>`, `2>`, `&>`), write to files under `logs/` (for example `logs/lint.log`) and do not use `/tmp`.
- Runtime config policy: type and validate environment/config values with `zod` in main-process config modules, even when implementation is JavaScript (`.mjs`), to keep runtime behavior explicit and future TypeScript migration-ready.
- Asset policy: treat `src/assets/logo-white-bg.svg` as the source of truth for app icons; when it changes, regenerate `src/assets/icons/icon.png`, `src/assets/icons/icon.ico`, and `src/assets/icons/icon.icns` in the same change.
- Release policy: stable releases are managed by Release Please via `.github/workflows/release-please.yml` (version bump + changelog + release notes), while `.github/workflows/release.yml` remains tag-driven for packaging and artifact attachment.
- Skill usage announcement policy: when using a custom/local skill workflow, explicitly announce the skill name to the user before executing it.

## Commands

- Install dependencies: `proto run yarn -- install`
- Run a script: `proto run yarn -- <script-name>`
- Start local desktop dev runtime: `proto run yarn -- dev`
- Run tests: `proto run yarn -- test`
- Build renderer bundle: `proto run yarn -- build`
- Build unpacked desktop app bundle: `proto run yarn -- package`
- Build packaged release artifacts: `proto run yarn -- dist`
- Validate commit messages locally: `proto run yarn -- commitlint --edit <path-to-commit-message-file>`

If scripts are missing, propose adding only the minimum required scripts in `package.json`.

## Suggested Architecture Direction

- Keep media-processing logic isolated from UI concerns.
- Prefer pure utility modules for ffmpeg argument building and timeline math.
- Wrap external process calls behind small interfaces to simplify testing.
- Electron main and preload code should be written as ESM `.mjs` modules, with `src/main/main.mjs` as the application entrypoint.
- Prefer bundled ffmpeg resolution first, with explicit override support (`CUTRAIL_FFMPEG_PATH`) and system-path fallback only as a last resort.
- Keep renderer views separated by responsibility (main workflow vs utility windows such as About).
- Open one editor window per selected source video so multiple videos can be edited/exported independently at the same time.
- Create renderer windows frameless and use shared custom chrome with minimize, maximize, and close controls; splash windows should remain decoration-free and include only an in-app close button.
- Use `vanilla-extract` styles alongside `@sabinmarcu/theme` tokens for renderer styling work.
- Use `@renderer/*` and `@assets/*` aliases for renderer imports instead of deep relative paths.
- Keep renderer source in TypeScript (`.ts` / `.tsx`) and migrate legacy renderer JavaScript incrementally to TypeScript.
- For shared window UI patterns, prefer shared wrapper components with co-located styles over shared style-only modules.
- Keep splash, editor, and options responsibilities separated into distinct window modules.
- Prefer shared reusable primitives in `src/renderer/components` (for example generic button components).
- Keep clipping workflow state/logic in `src/renderer/core/clipping` using Context API.
- Use grouped core feature file naming and barrel exports for renderer core modules.
- Keep editor-only timeline UI modules under `src/renderer/windows/editor/components/TimelineEditor`.
- Keep shared button primitive under `src/renderer/components/button/button.tsx` with co-located `button.css.ts`.
- Keep main-process IPC handlers under `src/main/ipc/handlers` (one handler per file).
- Keep main-process window modules under `src/main/windows`.
- Keep Electron main/preload modules as ESM `.mjs` files with `// @ts-check` enabled and explicit JSDoc type annotations for exported APIs.
- Keep in-app updates on `electron-updater` for packaged GitHub-release installs; on Linux, only allow self-update when running as AppImage and keep AUR installs package-manager-driven.

## Pull Request Expectations

- Include a short summary of behavior changes.
- Mention manual verification steps.
- Call out tradeoffs and any follow-up work.
