---
applyTo: "src/{main,preload,domain,infra}/**/*.{js,cjs,mjs,ts,tsx}"
---

# Core Modules Instructions

Follow these rules as hard requirements for non-renderer source modules.

## Hard Rules

1. Keep source files between 1 and 200 lines whenever possible.
- If a file exceeds 200 lines, split it into focused modules.

2. Keep one primary responsibility per file.
- Avoid mixing process orchestration, persistence, and domain logic in one module.

3. Prefer small composable modules.
- Use dedicated modules for constants, IO helpers, adapters, and orchestration.

4. Keep domain logic pure where possible.
- `src/domain` modules should avoid side effects and UI/runtime coupling.

5. Keep infrastructure adapters isolated.
- `src/infra` should wrap external process/runtime interactions behind small interfaces.

6. Keep preload surface narrow.
- `src/preload` should expose only explicit, minimal bridge APIs.

7. Use ESM for main/preload modules.
- Prefer `.mjs` for `src/main` and `src/preload` modules.
- Keep new Electron entry and helper modules in ESM format unless there is a specific interop reason to preserve CommonJS.

8. Type-check JavaScript in Electron modules.
- Use `// @ts-check` in `src/main/**/*.mjs` and `src/preload/**/*.mjs` modules.
- Add explicit JSDoc types for exported functions and externally-consumed APIs in those modules.

## Governance

- Any change to these core-module conventions must update this file in the same change set.
- If architectural boundaries change, update this file and `AGENTS.md` together.
