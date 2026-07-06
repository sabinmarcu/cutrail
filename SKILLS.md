# SKILLS

Repository tool skillbook: setup, intent, and operational commands.

## Project Identity

- Product name: `cutrail`
- Repository name: `cutrail`
- Current delivery phase: Early Phase 1 single-video clipping MVP with timeline-based editing.

## External Package Documentation

 Electron main and preload code use ESM `.mjs` modules, with `src/main/main.mjs` as the entrypoint.
 Renderer code is TypeScript-first (`.ts` / `.tsx`).
 Electron `.mjs` modules are JS with `// @ts-check` and explicit JSDoc typing on exported APIs.
 Runtime environment/config values in main process should be validated with `zod`.

## AI Documentation Maintenance

When repository behavior changes, AI-facing docs must stay in sync.

Required updates:

- Architecture/tooling updates (examples: adding TypeScript, changing build system, replacing lint tooling, changing package manager strategy).
- Guidance/style updates (examples: file-structure conventions, test expectations, utility/type-test rules).
- User-facing docs command formatting: document runnable scripts as direct `yarn ...` commands rather than `proto run yarn -- ...`.

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
- `docs/styling-guide.md`
- `.github/instructions/styling-guide.instructions.md`
- `.github/instructions/renderer-architecture.instructions.md`
- `.github/instructions/core-modules.instructions.md`
- `.github/instructions/release-flow.instructions.md`
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
- Use `docs/styling-guide.md` for renderer structure, component file sizing, child component naming, and style co-location rules.
- Use `.github/instructions/styling-guide.instructions.md` for enforceable renderer styling rules.
- Use `.github/instructions/renderer-architecture.instructions.md` for enforceable renderer layout and component-placement rules.
- Use `.github/instructions/core-modules.instructions.md` for enforceable non-renderer module sizing and boundary rules.

Rule of thumb: if a human contributor would need to know it to work correctly, AI docs should be updated in the same change.

Skill communication rule:

- When an agent invokes a custom/local skill flow, it should announce the exact skill name to the user before executing skill-driven steps.

## Local Custom Skills

- `.github/skills/github-release-flow/SKILL.md`: stable GitHub release flow (tag creation/push, tag-version parity, release workflow expectations).
- `.github/skills/aur-release-flow/SKILL.md`: `cutrail-bin` AUR release update flow after successful GitHub Release validation.

Styling governance rule:

- Agents must treat `docs/styling-guide.md` as a hard-rule instruction file for renderer/component styling and structure.
- Any styling-system or style-convention change must update `docs/styling-guide.md` in the same change set.
- Agents must also treat `.github/instructions/styling-guide.instructions.md` and `.github/instructions/renderer-architecture.instructions.md` as hard-rule instruction files.
- Agents must also treat `.github/instructions/core-modules.instructions.md` as a hard-rule instruction file.
- For shared renderer window patterns, agents must prefer shared wrapper components with co-located styles over shared style-only modules.
- For renderer workflow boundaries, agents must keep splash, editor, and options concerns in distinct window modules and avoid mixing source/output controls into editor-local chrome.
- Agents must place shared cross-window utility components under `src/renderer/components/*`.
- Agents must place editor-only timeline modules under `src/renderer/windows/editor/components/TimelineEditor/*`.
- Agents must keep clipping workflow state and logic in Context API modules under `src/renderer/core/clipping/*`.
- Agents must use grouped core feature naming with barrel exports for renderer core modules.
- Agents must keep shared button primitives under `src/renderer/components/button/*` with co-located styles.
- Agents must keep IPC handlers split one-per-file under `src/main/ipc/handlers` and window modules under `src/main/windows`.
- Agents must create renderer windows frameless and use shared custom chrome with minimize, maximize, and close controls; splash windows must remain decoration-free and include only an in-app close control.
- Agents should prefer `@renderer/*` and `@assets/*` aliases for renderer imports instead of long relative paths.

## proto (moonrepo)

Current repository pinning is defined in `.prototools`:

- `node = "~22"`
- `yarn = "~4"`

### What proto does here

- Pins Node and Yarn versions for consistent local/CI behavior.
- Enables predictable tool resolution based on the repository configuration.
- Repository policy: use proto instead of corepack at all times.

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

Release automation note:

- Tag-driven release workflows should enforce `vX.Y.Z` tag parity with `package.json` version (for example via `yarn check:tag-version`) before building and publishing release assets.

## Yarn (Berry 4.x, node_modules linker)

Repository package manager:

- `packageManager: "yarn@4.17.0"` in `package.json`

Behavior and conventions:

- Uses Yarn Modern (Berry) with `nodeLinker: node-modules` configured in `.yarnrc.yml`.
- Lockfile (`yarn.lock`) is committed.
- `.yarn/` and `node_modules/` are gitignored.

Core commands:

- `proto run yarn -- install`
- `proto run yarn -- commitlint --help`
- `proto run yarn -- dev`
- `proto run yarn -- build`
- `proto run yarn -- package`
- `proto run yarn -- dist`
- `proto run yarn -- test`
- `proto run yarn -- verify:ffmpeg`
- `proto run yarn -- lint`
- `proto run yarn -- lint:fix`
- `proto run yarn -- lint:staged`

Packaging notes:

- `electron-builder` is configured in `package.json` under `build`.
- Platform icon assets are stored in `src/assets/icons` (`icon.png`, `icon.ico`, `icon.icns`).
- `src/assets/logo-white-bg.svg` is the source image for platform icons; when it changes, regenerate all icon files under `src/assets/icons` in the same change set.

Current source layout baseline:

- `src/main` for Electron main-process bootstrap.
- `src/preload` for the constrained bridge API.
- `src/renderer` for React UI shell.
- `src/domain` for pure clip/timeline logic.
- `src/infra` for ffmpeg process integration.

Current renderer architecture notes:

- Main clipping workflow and About view are separate renderer modes selected at runtime.
- Renderer styling uses `vanilla-extract` with `@sabinmarcu/theme` tokens.
- Clip editing UX is timeline-first with embedded video synchronization.

FFmpeg runtime policy:

- Prefer bundled ffmpeg from `@ffmpeg-installer/ffmpeg`.
- Allow explicit override through `CUTRAIL_FFMPEG_PATH`.
- Fall back to system `ffmpeg` only when bundled/override binaries are unavailable.
- Keep attribution and compliance notes in `THIRD_PARTY_NOTICES.md`.

Linker note:

- Electron and related tooling are more reliable with `node_modules` layout in this repository.

## ESLint

This repository uses local flat config in `eslint.config.mjs`.

### Scope model

- Source lint target: `src/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}`
- Root config overrides apply only to files that actually exist at the repository root and match:
  - `eslint.config.*`
  - `*.config.*`
  - `.*rc.*`
- Global ignores include generated/package-manager artifacts:
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
- Agent workflow rule: prefer `yarn lint:fix` before checks, then run `yarn lint` and `yarn typecheck`, and manually fix only non-autofixable issues.
- Agent temporary-output rule: write temporary command outputs/artifacts under `logs/`.
- Redirection rule: for shell redirects (`>`, `2>`, `&>`), capture logs to `logs/*.log` and avoid `/tmp` paths.

## Yarn script policy

- Repository-level `.yarnrc.yml` sets `enableScripts: true`.
- This is required for packages such as Electron and esbuild that need postinstall build/download steps.
- Repository-level `.yarnrc.yml` also sets `nodeLinker: node-modules`.

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
