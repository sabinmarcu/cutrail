# SKILLS

Repository tool skillbook: setup, intent, and operational commands.

## Project Identity

- Product name: `cutrail`
- Repository name: `video-trimmer`
- Current delivery phase: Phase 0 foundation validation with Electron + React bootstrap.

## AI Documentation Maintenance

When repository behavior changes, AI-facing docs must stay in sync.

Required updates:

- Architecture/tooling updates (examples: adding TypeScript, changing build system, replacing lint tooling, changing package manager strategy).
- Guidance/style updates (examples: file-structure conventions, test expectations, utility/type-test rules).

Files to keep synchronized:

- `README.md`
- `.github/copilot-instructions.md`
- `AGENTS.md`
- `SKILLS.md`

Discovery and planning files to reference in AI workflows:

- `docs/vision-and-motivation.md`
- `docs/technical-background-and-plan.md`
- `docs/distribution-and-publishing.md`
- `docs/phased-implementation-plan.md`
- `docs/publishing-access-and-manual-steps.md`
- `docs/release-and-update-research.md`
- `docs/phases/phase-0-foundation-validation.md`
- `docs/phases/phase-1-single-video-clipping-mvp.md`
- `docs/phases/phase-2-source-library-and-workflow-maturity.md`
- `docs/phases/phase-3-accuracy-presets-and-export-controls.md`
- `docs/phases/phase-4-distribution-readiness.md`
- `docs/phases/phase-5-platform-polish-and-expansion.md`

Planning priority for agents:

- Start with `docs/phased-implementation-plan.md` for task ordering and milestone selection.
- Then use the detailed file for the active phase under `docs/phases/` to choose concrete work, validation, and boundaries.
- Use the other planning docs as supporting references for product intent, technical constraints, and distribution choices.
- Use `docs/publishing-access-and-manual-steps.md` when release work depends on GitHub permissions, AUR credentials, or maintainer-only approvals.
- Use `docs/release-and-update-research.md` when release work depends on changelog policy, Conventional-Commit release engines, or Electron updater tradeoffs.

Rule of thumb: if a human contributor would need to know it to work correctly, AI docs should be updated in the same change.

## proto (moonrepo)

Current repository pinning is defined in `.prototools`:

- `node = "~26"`
- `yarn = "~4"`

### What proto does here

- Pins Node and Yarn versions for consistent local/CI behavior.
- Enables predictable tool resolution based on the repository configuration.

### Setup and usage

1. Install proto (once per machine), then ensure `~/.proto/bin` is on PATH.
2. In this repository, run:
   - `proto install node`
   - `proto install yarn`
3. Validate environment:
   - `proto status`
   - `proto run node -- --version`
   - `proto run yarn -- --version`

### MCP setup and usage

This repository includes VS Code MCP server configuration at `.vscode/mcp.json` using:

- command: `proto`
- args: `mcp`
- transport: stdio

Useful checks:

- `proto mcp --info` to inspect exposed MCP tools/resources.

Current documented proto MCP capabilities include:

- Tools: `install_tool`, `uninstall_tool`, `list_tool_versions`, `get_config`
- Resources: `proto://config`, `proto://env`, `proto://tools`

## Yarn (Berry 4.x, PnP)

Repository package manager:

- `packageManager: "yarn@4.17.0"` in `package.json`

Behavior and conventions:

- Uses Yarn Modern (Berry) with PnP artifacts (`.pnp.cjs`, `.pnp.loader.mjs`).
- Lockfile (`yarn.lock`) is committed.
- `.yarn/` and `.pnp.*` are gitignored per non-zero-install style.

Core commands:

- `yarn install`
- `yarn commitlint --help`
- `yarn dev`
- `yarn build`
- `yarn test`
- `yarn lint`
- `yarn lint:fix`
- `yarn lint:staged`

Current source layout baseline:

- `src/main` for Electron main-process bootstrap.
- `src/preload` for the constrained bridge API.
- `src/renderer` for React UI shell.
- `src/domain` for pure clip/timeline logic.
- `src/infra` for ffmpeg process integration.

PnP note:

- Peer dependency issues are surfaced explicitly. Fix by adding missing direct deps or by configuring package extensions when needed.

## ESLint

This repository uses local flat config in `eslint.config.mjs`.

### Scope model

- Source lint target: `src/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}`
- Root config overrides apply only to files that actually exist at the repository root and match:
  - `eslint.config.*`
  - `*.config.*`
  - `.*rc.*`
- Global ignores include generated/package-manager artifacts:
  - `.pnp.*`
  - `.yarn/**`
  - `node_modules/**`

Core lint command:

- `yarn lint`

### Type test support

- `eslint-plugin-expect-type` is installed and intended for type-level tests.
- Use `*.type.ts` for type assertions/tests where applicable.

### Commands

- `yarn lint` (strict; max warnings 0)
- `yarn lint:fix` (autofix)

## Yarn script policy

- Repository-level `.yarnrc.yml` sets `enableScripts: true`.
- This is required for packages such as Electron and esbuild that need postinstall build/download steps.

## Husky + lint-staged + Commitlint

Current setup uses Husky v9 style (native hook scripts, no legacy JS config).

- `prepare` script: `husky`
- Hook file: `.husky/pre-commit`
- Hook file: `.husky/commit-msg`
- Pre-commit action: `yarn lint:staged`
- Commit-msg action: `yarn commitlint --edit "$1"`
- lint-staged config file: `lint-staged.config.mjs`
- Commitlint config file: `commitlint.config.mjs`

Staged lint behavior:

- Lints staged source files in `src`.
- Runs ESLint with fix enabled before commit (`eslint --fix --max-warnings=0`).

Maintenance checks:

1. Reinstall hooks if needed with `yarn prepare`.
2. Verify hook exists and is executable at `.husky/pre-commit`.
3. Verify hook exists and is executable at `.husky/commit-msg`.
4. Keep lint-staged config in `lint-staged.config.mjs` (not inline in `package.json`).
5. Keep commitlint config in `commitlint.config.mjs`.
