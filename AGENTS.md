# AGENTS

This file defines how coding agents should work in this repository.

## Project Identity

- Product name: `cutrail`
- Repository name: `video-trimmer`

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

## Planning Priority

- Use `docs/phased-implementation-plan.md` as the primary execution roadmap when deciding what to build next.
- Use the matching file under `docs/phases/` for the detailed plan of the active phase.
- Use the other planning documents to constrain scope, architecture, and release strategy.
- Use `docs/publishing-access-and-manual-steps.md` to separate maintainer-only publishing setup from agent-automatable work.
- Use `docs/release-and-update-research.md` to guide release tool selection, changelog generation, and updater choices.
- If implementation sequencing changes materially, update `docs/phased-implementation-plan.md` in the same change.

## Component File Layout

For each component, prefer this layout:

- `Component.tsx` (required)
- `Component.css.ts` (required when styled)
- `Component.utils.ts` (optional)
- `Component.utils.type.ts` (optional type tests)
- `Component.spec.ts` (optional)
- `Component.stories.ts` (optional)

Notes:

- Storybook and unit tests are optional by feature.
- `*.type.ts` files are type-level tests intended to be validated by ESLint tooling (`eslint-plugin-expect-type` through the shared ESLint preset).
- When utility functions have meaningful type contracts, add or update matching type tests (for example, `Component.utils.type.ts`).

## Lint And Commit Workflow

- Start local desktop runtime with `yarn dev`.
- Build renderer assets with `yarn build`.
- Run unit tests with `yarn test`.
- Run lint checks with `yarn lint`.
- Run autofix with `yarn lint:fix`.
- Staged files are linted with fix via `yarn lint:staged`.
- Pre-commit hook runs `yarn lint:staged` through Husky.
- Commit messages are validated with Commitlint against Conventional Commits.
- Commit-msg hook runs `yarn commitlint --edit "$1"` through Husky.

## Agent Expectations

- Keep changes small and focused.
- Prefer modifying files under `src` unless adjusting root configuration.
- Keep root config changes explicit and minimal.
- Do not introduce additional formatters; ESLint is the formatter/linter authority in this workspace.
- If a change modifies architecture, tooling, or style guidance, update AI documentation in the same PR.
