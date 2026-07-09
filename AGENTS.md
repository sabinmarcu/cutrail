# AGENTS

This file defines how coding agents should work in this repository.

## Project Identity

- Product name: `cutrail`
- Repository name: `cutrail`

## External Package Docs

- `@sabinmarcu/*` package documentation source: https://github.com/sabinmarcu/omnirepo
- If present, consult local machine overrides in `AI_LOCAL_OVERRIDES.md` for filesystem paths that mirror remote docs/repositories.

## Project Direction

- Build UI with React.
- Use `@sabinmarcu/theme` as the primary design/theme system.
- Use `vanilla-extract` for styling, coordinated with `@sabinmarcu/theme` tokens and patterns.
- Current phase baseline includes Electron main/preload + React renderer scaffold under:
	- `src/main`
	- `src/preload`
	- `src/renderer`
	- `src/domain`
	- `src/infra`
- Electron main and preload modules are ESM `.mjs` files, with `src/main/main.mjs` as the application entrypoint.
- Renderer now has multiple runtime modes from the same entrypoint:
	- Main clipping workflow window
	- About utility window
	- Options, diagnostics, and licenses utility windows
- Renderer shared imports should use `@renderer/*` and `@assets/*` aliases instead of long relative paths.
- Editor workflow windows are multi-instance: each selected source video should open its own independent editor window.
- Main clipping workflow should prefer embedded video + interactive timeline editing over manual numeric range inputs.
- Component file names and component names should use CamelCase.
- ffmpeg runtime policy for this repository is bundled-first (`@ffmpeg-installer/ffmpeg`), with optional `CUTRAIL_FFMPEG_PATH` override and system-path fallback.
- Updater policy for this repository is `electron-updater` for packaged GitHub-release installs; Linux self-update should be AppImage-only, and AUR installs must remain package-manager updated.

## AI Documentation Sync Policy

- Any architecture or tooling change must be reflected in AI documentation in the same change set.
- At minimum, update the relevant AI files when changing languages, framework/runtime, package manager behavior, build/test/lint tooling, commit hooks, or workspace layout.
- Guidance/style-guide updates must also be reflected in AI documentation (for example, component file structure changes, testing expectations, or naming conventions).
- Primary sync targets are `README.md`, `.github/copilot-instructions.md`, `AGENTS.md`, and `SKILLS.md`.
- Discovery and planning sources must also be kept current when relevant:
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

## Planning Priority

- Use `docs/phased-implementation-plan.md` as the primary execution roadmap when deciding what to build next.
- Use the matching file under `docs/phases/` for the detailed plan of the active phase.
- Use the other planning documents to constrain scope, architecture, and release strategy.
- Use `docs/publishing-access-and-manual-steps.md` to separate maintainer-only publishing setup from agent-automatable work.
- Use `docs/release-and-update-research.md` to guide release tool selection, changelog generation, and updater choices.
- If implementation sequencing changes materially, update `docs/phased-implementation-plan.md` in the same change.

## Component And Styling Rules

Agents must follow `docs/styling-guide.md`, `.github/instructions/styling-guide.instructions.md`, `.github/instructions/renderer-architecture.instructions.md`, `.github/instructions/core-modules.instructions.md`, and `.github/instructions/release-flow.instructions.md` as hard requirements.

Required constraints:

- Keep files between 1 and 200 lines whenever possible; split when larger.
- One React component per file.
- Child components used by only one master/page should use `MasterComponent.ChildComponent.tsx` naming.
- Renderer windows live under `src/renderer/windows/X`.
- Cross-window shared components live under `src/renderer/components`.
- Window-specific exception path is allowed at `src/renderer/windows/components/X`.
- Styles are co-located with components and shared only when tightly related.
- For shared window-level UI patterns, prefer shared wrapper components over shared style-only modules.
- Prefer CSS cascade for common styling behavior.
- Keep splash (`app`), editor (`editor`), and options (`options`) responsibilities in separate window modules.
- Source selection belongs to File/splash entry actions; output-directory configuration belongs to options window UI.
- Shared utility components used by multiple windows must live under `src/renderer/components/*`.
- Related windows that belong to one flow may share a folder, such as `src/renderer/windows/updates`.
- Editor-only timeline components must live under `src/renderer/windows/editor/components/TimelineEditor/*`.
- Clipping state/logic must live under `src/renderer/core/clipping/*` using Context API.
- Core feature modules should use grouped naming (`feature.ts`, `feature.context.tsx`, `feature.provider.tsx`, etc.) with barrel exports.
- Shared button primitive should live under `src/renderer/components/Button/Button.tsx` with `Button.css.ts`.
- Keyboard controls intended for regular users should include Vim-style equivalents where practical.
- Renderer windows should be frameless and use shared custom chrome with minimize, maximize, and close controls; splash windows must stay decoration-free and expose only an in-app close button.
- Main-process IPC handlers must be split one-per-file under `src/main/ipc/handlers`.
- Main-process window modules must live under `src/main/windows`.
- Main/preload `.mjs` modules must keep `// @ts-check` enabled and use explicit JSDoc typings on exported APIs.

Maintenance rule:

- Any styling convention change must update `docs/styling-guide.md` in the same change set.
- Any renderer structure convention change must update `.github/instructions/renderer-architecture.instructions.md` in the same change set.
- Any non-renderer module boundary convention change must update `.github/instructions/core-modules.instructions.md` in the same change set.
- Any release/versioning convention change must update `.github/instructions/release-flow.instructions.md` in the same change set.

## Lint And Commit Workflow

- Use `proto` for all tool execution in this repository; never use `corepack`.
- Use `@sabinmarcu/eslint-config` as the required ESLint flat-config baseline in `eslint.config.mjs`; do not replace it with ad-hoc standalone rule sets.
- When authoring user-facing documentation (for example `README.md`, `BUILD.md`, `CONTRIBUTING.md`), use direct script commands (`yarn ...`) instead of `proto run yarn -- ...`.
- Type and validate runtime environment/config values with `zod` in main-process config modules.
- Start local desktop runtime with `proto run yarn -- dev`.
- Build renderer assets with `proto run yarn -- build`.
- Build unpacked app artifacts with `proto run yarn -- package`.
- Build distributable artifacts with `proto run yarn -- dist`.
- Stable GitHub Releases should be created by Release Please through `.github/workflows/release-please.yml`; `.github/workflows/release.yml` should package assets for the emitted `vX.Y.Z` tag and attach them to the existing release.
- Run unit tests with `proto run yarn -- test`.
- Run lint checks with `proto run yarn -- lint`.
- Run autofix with `proto run yarn -- lint:fix`.
- Agent lint workflow rule: run `proto run yarn -- lint:fix` first, then run `proto run yarn -- lint` and `proto run yarn -- typecheck`; only manually fix issues that remain after autofix.
- Staged files are linted with fix via `proto run yarn -- lint:staged`.
- Pre-commit hook runs `proto run yarn -- lint:staged` through Husky.
- Commit messages are validated with Commitlint against Conventional Commits.
- Commit-msg hook runs `proto run yarn -- commitlint --edit "$1"` through Husky.

## Agent Expectations

- Keep changes small and focused.
- Prefer modifying files under `src` unless adjusting root configuration.
- Keep root config changes explicit and minimal.
- Do not introduce additional formatters; ESLint is the formatter/linter authority in this workspace.
- Use `logs/` for temporary local artifacts (for example command output captures); do not write temporary files outside this folder.
- When redirecting command output (`>`, `2>`, `&>`), write captures under `logs/` (for example `logs/build.log`) rather than `/tmp`.
- Announce skill usage explicitly before running a custom/local skill flow (for example, "Using skill: github-release-flow").
- If a change modifies architecture, tooling, or style guidance, update AI documentation in the same PR.
- Treat `src/assets/logo-white-bg.svg` as the source image for application icons. Any change to that file must regenerate `src/assets/icons/icon.png`, `src/assets/icons/icon.ico`, and `src/assets/icons/icon.icns` in the same change set.
