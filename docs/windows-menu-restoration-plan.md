# Windows Menu Restoration Plan

## Objective

Restore visible, usable menu access on Windows while keeping custom frameless window decorations.

## Background

- The app already defines a full native application menu in `src/main/menu.ts`.
- Windows are created frameless in `src/main/windows/windowDefaults.ts`.
- `autoHideMenuBar` is currently enabled globally, which prevents reliable menu discoverability on Windows.
- Renderer windows already use shared custom chrome in `src/renderer/components/WindowDecoration/WindowDecoration.tsx`.

## Delivery Strategy

### Milestone 1: Quick Restore (Native Menu Visibility on Windows)

Goal: Make menu access visible again on Windows with minimal risk.

Implementation:

1. Update `src/main/windows/windowDefaults.ts` so `autoHideMenuBar` is disabled on Windows.
2. Keep existing native menu template and lifecycle unchanged in `src/main/menu.ts` and `src/main/bootstrap.ts`.

Acceptance criteria:

- On Windows, top app menu is visible for decorated windows without requiring Alt.
- Existing accelerators still function.
- No behavior changes on macOS.
- Lint and build pass.

### Milestone 2: In-App Styled Menu Shell (File + Help)

Goal: Introduce custom styled menu in renderer chrome for parity with frameless design.

Implementation:

1. Add a shared menu bar component near `WindowDecoration` in renderer shared components.
2. Add IPC bridge methods to fetch menu model and execute menu actions.
3. Add main-process handlers to map action ids to existing menu operations.
4. Render the new menu in shared window decoration for non-splash windows.

Acceptance criteria:

- Users can open File and Help menus from custom chrome.
- Actions (Open Video, Library, Options, About, Licenses, Check for Updates) execute correctly.
- Renderer keyboard focus and click interactions work.

### Milestone 3: Full Parity (Edit, View, Development)

Goal: Reach practical parity with existing native menu actions.

Implementation:

1. Expand menu model and action dispatch for Edit, View, and Development sections.
2. Keep window-scoped behavior correct for focused window operations.

Acceptance criteria:

- All high-value native menu actions are available from styled menu.
- Dev-only actions remain available where appropriate.

### Milestone 4: Keyboard and Accessibility Polish

Goal: Make custom menu efficient and accessible.

Implementation:

1. Add Alt-to-focus behavior for top-level menu.
2. Add arrow-key navigation, Enter activation, Escape close.
3. Add ARIA roles/attributes for menu and menuitems.

Acceptance criteria:

- Menu can be fully operated by keyboard.
- Screen-reader semantics are present for core controls.

### Milestone 5: Native Menu Role Decision on Windows

Goal: Decide final coexistence policy between native and custom menus.

Decision options:

1. Keep both (native fallback + styled primary).
2. Keep native hidden by default with explicit fallback toggle.
3. Remove visible native menu once confidence is high.

Acceptance criteria:

- Documented decision with rationale.
- No regression in discoverability or shortcut support.

Decision taken:

- Keep both, with native/global menu as the primary source for shortcuts and platform integration.
- Keep custom in-window menu as optional fallback UI when global/native visibility is unavailable.

Rationale:

- Preserves platform-native accelerators and behavior (Reload, Force Reload, DevTools, Edit/View roles).
- Maintains discoverability in frameless contexts where native/global menu visibility can vary by desktop/session.
- Reduces drift risk by sharing one action/model source between native and in-window menus.

Status:

- Milestone 1 complete.
- Milestone 2 complete.
- Milestone 3 complete.
- Milestone 4 complete.
- Milestone 5 complete with the above coexistence policy.

## Risks and Mitigations

- Frameless + native menu behavior can vary by platform window manager.
- Custom menu action drift from native template is possible.

Mitigations:

- Reuse shared action ids and central dispatch in main process.
- Keep native menu as fallback until parity is validated.

## Validation Plan

For each milestone:

1. Run lint autofix first.
2. Run lint.
3. Run typecheck/build.
4. Manually verify menu actions in main windows.

Command policy:

- Use proto-run commands for local validation.
