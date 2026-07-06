---
applyTo: "src/renderer/**/*.{js,jsx,ts,tsx,css.ts}"
---

# Renderer Architecture Instructions

Follow these rules as hard requirements for renderer structure and component placement.

## Window And Component Structure

1. Place renderer windows under:
- `src/renderer/windows/X`

2. Place components shared across multiple windows under:
- `src/renderer/components`

3. Window-local component exception:
- A window may group local components under:
  - `src/renderer/windows/components/X`
- Use this only for components local to one window domain.

4. Child component naming for single-master usage:
- Pattern: `MasterComponent.ChildComponent.tsx`

5. Shared UI behavior must be componentized.
- For cross-window presentation/layout patterns, create shared React wrapper components.
- Avoid exposing shared window primitives as style-only modules consumed directly by window entries.
- Prefer `@renderer/*` and `@assets/*` aliases for shared renderer imports instead of deep relative paths.

6. Keep window responsibilities explicit.
- `app` window mode is the splash/entry experience.
- `editor` window mode owns timeline editing and export controls.
- `options` window mode owns persistent app configuration (for example output directory).
- Source file selection should be triggered from File menu actions and splash-entry actions, not from editor-local controls.

7. Shared utility components must use shared component paths.
- Components reused by multiple windows (for example `UtilityWindow`) must live under `src/renderer/components/*`.
- Do not place cross-window shared components under `src/renderer/windows/components/*`.

8. Editor-local timeline modules must stay editor-local.
- Timeline editor UI modules used only by editor must live under `src/renderer/windows/editor/components/TimelineEditor/*`.
- Keep timeline playback, timeline interaction, and range-list UI split into dedicated component files.

9. Clipping logic belongs in renderer core context modules.
- Shared clipping state and logic must live under `src/renderer/core/clipping/*`.
- Use Context API to provide clipping state/actions to editor window and editor-local components.

10. Use grouped core module naming and barrels.
- Core feature modules should use grouped filenames such as `feature.ts`, `feature.context.tsx`, `feature.provider.tsx`, and `feature.*.ts` helper modules.
- Provide barrel exports for feature folders (for example `src/renderer/core/clipping/index.ts`) and a top-level core barrel (`src/renderer/core/index.ts`).

11. Editor windows are multi-instance per source video.
- Opening a source video should create an independent editor window instance for that source.
- Opening another source while an editor window is active should create another independent editor window.

12. Keyboard shortcut parity rule.
- When adding keyboard controls intended for regular users, include Vim-style equivalents where practical.
- Example: left/right movement controls should support both arrow keys and `h` / `l`.

13. Custom window chrome.
- Renderer windows should be created frameless and use shared renderer decoration instead of native title bars.
- Shared decoration should provide minimize, maximize/restore, and close controls on the right.
- Splash windows must remain decoration-free and expose only an in-app close button.
- Utility and About windows should render a shared decoration above their content.
- Editor windows should render the shared decoration above the editing area in the normal flow, not as an overlay.

## Module Boundaries

- Keep window entry components and shared components separated by folder intent.
- Avoid cross-window coupling through window-local modules.

## Governance

- Any renderer structure policy change must update this file and `docs/styling-guide.md` in the same change set.
