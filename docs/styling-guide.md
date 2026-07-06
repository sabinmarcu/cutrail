# Styling Guide

This file is the source of truth for renderer styling and component-structure rules.

## Hard Rules

1. File length limit
- Keep source files between 1 and 200 lines whenever possible.
- If a file exceeds 200 lines, split it into focused child modules.

2. One component per file
- Define one React component per file.
- Keep helper utilities in separate files.

3. Child component naming
- If a component is used by only one page or one master component, use:
  - `MasterComponent.ChildComponent.tsx`
- Keep the child component near its master component.

4. Window layout structure
- Renderer windows must live under:
  - `src/renderer/windows/X`
- Components shared across multiple windows must live under:
  - `src/renderer/components`

5. Window-level exception
- A window may group local components in a sibling folder when that improves maintainability:
  - `src/renderer/windows/components/X`
- Use this exception only for components local to one window domain.

6. Style co-location
- Co-locate styles with their component.
- Prefer `Component.css.ts` next to `Component.tsx`.

7. Style sharing policy
- Share styles only when components are tightly related.
- Avoid broad shared style files for unrelated components.
- Prefer natural CSS cascade for global/common behavior.

8. Componentized sharing over style-only sharing
- For shared window UI patterns, create shared wrapper components (for example, `UtilityWindow`) and render them where needed.
- Co-locate shared styles with the shared component itself.
- Avoid importing broad cross-window shared style modules directly into window entry components.

9. Renderer separation of concerns
- Keep the splash/entry experience and editor workflow in separate window components.
- Keep persistent configuration UI (for example output directory management) in a dedicated options window.
- Trigger source file selection from File menu actions and splash-entry actions; avoid editor-local source-selection controls.
- Move reusable generic primitives (for example button components) into shared renderer component folders.

10. Shared utility component placement
- Cross-window shared components (for example `UtilityWindow`) must live under `src/renderer/components/*`.
- Do not keep cross-window shared components under window-scoped folders.
- Use renderer aliases such as `@renderer/*` and `@assets/*` for cross-window imports where practical.

11. Editor timeline module placement
- Timeline editor modules used only by editor must live under `src/renderer/windows/editor/components/TimelineEditor/*`.
- Keep playback, timeline interaction, and range list split into separate component files.

12. Clipping workflow core architecture
- Keep clipping workflow state and behavior under `src/renderer/core/clipping/*`.
- Use Context API as the shared source of truth for editor timeline, clip/range list, and export controls.

13. Main-process module boundaries
- Keep IPC handlers under `src/main/ipc/handlers` with one handler per file.
- Keep window-related main-process modules under `src/main/windows`.

14. Core grouping and barrels
- Use grouped feature naming for core modules (for example `clipping.ts`, `clipping.context.tsx`, `clipping.provider.tsx`, `clipping.actions.ts`, `clipping.state.ts`, `clipping.subscriptions.ts`).
- Provide barrel exports for core feature folders and a top-level core barrel.

15. Shared button primitive placement
- Keep the reusable button primitive under `src/renderer/components/button/button.tsx` with co-located `button.css.ts`.

16. Multi-instance editor workflow
- Opening a source video should open an independent editor window for that source.
- Opening another source video while an editor is open should spawn another independent editor window.

17. Visual system direction
- Use a flat terminal-inspired visual language across renderer windows: deep black-green backgrounds and phosphor-green/cyan accents.
- Avoid gradients, glow effects, and raised/elevated surface styling.
- Exception: subtle scanline overlays are allowed for video/timeline tracks.
- Prefer border-based separation between panels and controls.
- Avoid border radius on non-button UI surfaces.
- Keep sidebar and controls dark enough to match editor/video track backgrounds.
- Keep primary actions and key UI affordances in green/cyan accent tones.
- Use monospaced typography with uppercase headings/control labels where appropriate.

18. Editor video edge behavior
- Keep the editor video region flush with the editor content edge.
- Do not add margin/padding wrappers that offset the video frame from the editor edge.

19. Renderer global reset file
- Keep global constraints in a dedicated reset stylesheet (for example `src/renderer/windows/globalReset.css.ts`) imported by renderer bootstrap.
- Include universal `box-sizing: border-box`, root height defaults, and base body typography/background defaults.

20. Keyboard control parity
- Keyboard controls intended for regular users should include Vim-style equivalents where practical.
- Example: seek left/right should support both arrow keys and `h` / `l`.

21. Window chrome
- Create renderer windows frameless and replace native decoration with a shared renderer chrome component.
- Shared chrome should include minimize, maximize/restore, and close controls on the right.
- Splash windows must remain decoration-free and include only an in-app close button.
- Utility and About windows should place the shared chrome above content.
- Editor windows should place the shared chrome above the editing surface in the normal flow.

22. Vanilla-extract selector usage
- In `style({...})` blocks, use `selectors` only for rules that still target the current class via `&`.
- Do not target descendant elements from `selectors` (for example `& button` or `& a[href]`).
- For descendant/global targeting, use `globalStyle(`${scopedClass} ...`, {...})`.
- Keep direct pseudo selectors for the current class (`:hover`, `:focus-visible`, `::before`, etc.) within the style block.

## Ongoing Maintenance Rule

Any future styling-system, renderer-layout, or style-convention change must be recorded in this file in the same change set.

## Agent Instruction

All AI agents working in this repository must read and follow this file before making renderer/component styling or structural changes.
