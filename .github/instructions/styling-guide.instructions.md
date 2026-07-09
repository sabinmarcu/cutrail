---
applyTo: "src/renderer/**/*.{js,jsx,ts,tsx,css.ts}"
---

# Renderer Styling Instructions

Follow these rules as hard requirements for all renderer styling work.

## Hard Rules

1. Keep source files between 1 and 200 lines whenever possible.
- If a file exceeds 200 lines, split it into focused modules.

2. Keep one React component per file.
- Move helpers and utilities into separate files.

3. Keep component files and component names CamelCase.

4. Use child component naming for local-only children.
- Pattern: `MasterComponent.ChildComponent.tsx`.
- Use for components consumed by only one page/master component.

5. Co-locate styles with each component.
- Prefer `Component.css.ts` beside `Component.tsx`.

6. Minimize style sharing.
- Share style files only when components are tightly related.
- Prefer natural CSS cascade for common style behavior.
- Prefer shared wrapper components over shared style files.
- If two windows need common layout/styling behavior, create a shared React component and keep styles co-located with that component.
- Do not consume broad cross-window style token files directly from window entry components.

7. Enforce separation of concerns in renderer UI.
- Keep splash/entry UI styling isolated from editor workflow styling.
- Keep options/configuration styling isolated from editing workflow styling.
- Place reusable primitives (for example generic button components) under shared renderer component paths.

8. Utility and timeline styling placement rules.
- Styles for components shared across windows must be co-located under shared component paths (for example `src/renderer/components/utility`).
- Timeline editor styles used only by editor must be co-located under `src/renderer/windows/editor/components/TimelineEditor`.

9. Shared button component naming rule.
- Use `src/renderer/components/Button/Button.tsx` and co-located `Button.css.ts` for the shared button primitive.
- Avoid split naming where the component and style file live under unrelated names/paths.

10. Clipping state architecture styling rule.
- Keep clipping workflow state and behavior in Context API modules under `src/renderer/core/clipping`.
- UI component style files should consume context-provided state, not duplicate clipping business logic.

11. Current visual direction (global)
- Follow a flat terminal-inspired style: deep near-black surfaces with phosphor-green and cyan accents.
- Avoid gradients, shadows, and raised/elevated surface effects.
- Exception: scanline overlays for video/timeline tracks are allowed using subtle repeating-line patterns.
- Use borders and spacing to separate sections.
- Avoid border radius on non-button UI surfaces.
- Keep sidebar/control surfaces dark enough to match the editor/video track palette.
- Use uppercase mono typography for headings and controls with clear letter-spacing.
- Keep contrast readable; decorative glow must never reduce text legibility.

12. Editor video edge alignment
- In editor mode, the video region should be flush with the editor content edge (no extra margin/padding wrappers around the video frame).

13. Global reset stylesheet
- Keep global CSS constraints in a dedicated reset stylesheet under renderer windows and import it from renderer bootstrap.
- Include at least: universal `box-sizing: border-box`, full-height root sizing, and baseline body defaults.

14. Vanilla-extract selector rules
- In `style({...})` blocks, use `selectors` only when the selector still targets the current class via `&`.
- Do not target descendant elements from `selectors` (for example `& button` or `& a[href]`), as this is invalid in vanilla-extract style blocks.
- If descendant/global targeting is needed, use `globalStyle(`${scopedClass} ...`, {...})` instead.
- Keep pseudo selectors that directly target the current class (`:hover`, `:focus-visible`, `::before`, etc.) in the style block.

## Governance

- Any change to styling conventions must update `docs/styling-guide.md` in the same change set.
- Keep this instruction file and `docs/styling-guide.md` aligned.
