# Copilot Instructions for cutrail

This repository is initialized for AI-assisted development with GitHub Copilot.

## Project Context

- Project name: `cutrail`
- Repository name: `video-trimmer`
- Package manager: `yarn` (configured via `packageManager: yarn@4.17.0`)
- Current stage: Phase 0 foundation validation (Electron + React shell scaffolded)

## Working Guidelines

- Keep changes small and focused.
- Preserve existing style and conventions when adding code.
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
- After selecting a phase from `docs/phased-implementation-plan.md`, use the corresponding file under `docs/phases/` for detailed milestones, validation, and scope boundaries.
- Treat `docs/phased-implementation-plan.md` as the primary roadmap for deciding implementation order and the current delivery phase.
- Use `docs/publishing-access-and-manual-steps.md` whenever release automation touches GitHub permissions, AUR setup, or other maintainer-only actions.
- Use `docs/release-and-update-research.md` when choosing release tooling, changelog policy, or Electron update strategy.

## Commands

- Install dependencies: `yarn install`
- Run a script: `yarn <script-name>`
- Start local desktop dev runtime: `yarn dev`
- Run tests: `yarn test`
- Build renderer bundle: `yarn build`
- Validate commit messages locally: `yarn commitlint --edit <path-to-commit-message-file>`

If scripts are missing, propose adding only the minimum required scripts in `package.json`.

## Suggested Architecture Direction

- Keep media-processing logic isolated from UI concerns.
- Prefer pure utility modules for ffmpeg argument building and timeline math.
- Wrap external process calls behind small interfaces to simplify testing.

## Pull Request Expectations

- Include a short summary of behavior changes.
- Mention manual verification steps.
- Call out tradeoffs and any follow-up work.
