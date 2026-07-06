# Contributing

Thanks for your interest in contributing to cutrail (repository: `cutrail`).

## Before You Start

1. Read project guidance in:
   - `README.md`
   - `.github/copilot-instructions.md`
   - `AGENTS.md`
   - `SKILLS.md`
   - `docs/vision-and-motivation.md`
   - `docs/technical-background-and-plan.md`
   - `docs/distribution-and-publishing.md`
2. Confirm your changes comply with the project license in `LICENSE`.

## Development Setup

1. Install toolchain dependencies:
   - `proto install`
2. Install project dependencies:
   - `proto run yarn -- install`

## Branching And Commits

1. Create a feature branch from the default branch.
2. Keep commits focused and scoped to one concern when possible.
3. Use Conventional Commits for commit messages (for example `feat: add export queue shell`).
4. Commit messages are validated locally through the Husky `commit-msg` hook and Commitlint.

## Quality Checks

Before opening a pull request, run:

- `proto run yarn -- lint`
- `proto run yarn -- lint:fix` (if needed)

Pre-commit hooks run lint-staged automatically, but do not rely on hooks alone.
Commit messages are also validated locally against the conventional commit rules.

## Code And File Conventions

- Keep changes small and maintainable.
- Prefer modifying `src` unless changing root/project tooling.
- For React components, follow documented layout conventions in `AGENTS.md`.
- If utility type behavior changes, add/update corresponding type tests
  (`*.type.ts`, such as `Component.utils.type.ts`).

## Documentation Sync Requirement

If your PR changes architecture, tooling, or style guidance, you must update
the AI and human documentation in the same PR:

- `README.md`
- `.github/copilot-instructions.md`
- `AGENTS.md`
- `SKILLS.md`

Examples:

- adding/removing TypeScript,
- changing build/lint/test setup,
- changing component/file structure conventions,
- changing testing expectations.

## Pull Request Checklist

1. Describe what changed and why.
2. Include verification steps.
3. Note tradeoffs and follow-up work (if any).
4. Confirm docs are updated when required.
