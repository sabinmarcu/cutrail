# Technical Background and Plan

## High-Level Stack

- Desktop shell: Electron
- UI: React
- Styling: `@sabinmarcu/theme` + `vanilla-extract`
- Media processing: ffmpeg process execution
- Package manager and runtime tooling: Yarn 4 + proto-managed Node

## Architecture Direction

### Process model

Use Electron's standard separation:
- Main process: window lifecycle, native dialogs, filesystem orchestration, ffmpeg job orchestration.
- Preload bridge: narrow, explicit APIs exposed to renderer via `contextBridge`.
- Renderer: React UI and view state only.

### Security baseline

Adopt Electron security defaults and keep them strict:
- `contextIsolation: true`
- `nodeIntegration: false`
- Keep `webSecurity` enabled
- Avoid exposing raw `ipcRenderer` access
- Validate IPC sender for privileged handlers

This keeps the renderer unprivileged while allowing controlled access to native capabilities.

## Planned Modules

- `src/main/`
  - app bootstrap, BrowserWindow setup, menu wiring
  - dialog handlers (`open file`, `open directory`)
  - IPC registration and input validation
- `src/preload/`
  - typed bridge API
  - one method per IPC capability
- `src/renderer/`
  - pages: library, clip editor, settings, export queue
  - drag/drop entry points
- `src/domain/`
  - clip range math
  - timeline validation and normalization
  - output naming policy
- `src/infra/ffmpeg/`
  - ffmpeg command construction
  - process execution and progress parsing
  - error mapping

## Clip Processing Strategy

Two execution modes are useful:

1. Fast trim mode (stream copy)
- Goal: maximum speed, no quality loss.
- Typical approach:
  - input seek + duration
  - `-c copy`
- Limitation: cuts may not be frame-accurate for some codecs/container combinations.

2. Accurate trim mode (re-encode)
- Goal: frame-accurate clips.
- Typical approach:
  - decode from seek region
  - re-encode selected streams
- Tradeoff: slower and potentially lossy depending on codec settings.

Recommendation for Phase 1:
- Default to fast trim mode.
- Offer explicit "accurate" toggle with clear UX messaging.

## ffmpeg Command Design Notes

Use explicit stream mapping to avoid surprising behavior on multi-stream files.

Patterns to support:
- Select one input and produce one output per requested clip.
- Apply deterministic naming (for example `source__0001__00-10-05_00-10-25.mp4`).
- Return normalized diagnostics (exit code, stderr summary, retry hint).

## UI Workflow Plan

### Main screens

- Library screen
  - Shows source folder videos.
  - Search/filter by filename.
- Clip editor screen
  - Video preview and timeline with in/out points.
  - Multiple ranges per source.
- Queue/export screen
  - Pending/completed/failed jobs.
  - Retry and reveal in file manager.
- Settings screen
  - Source folder
  - Output folder
  - Default export mode (fast vs accurate)

### File ingress

- Menu item: open single file.
- Drag/drop onto app window.
- Folder scan from configured source directory.

## Data and State

Persist lightweight application state locally:
- Recent files/folders
- Last-used output folder
- Export defaults
- UI preferences

Do not store derived media cache aggressively in Phase 1. Keep disk footprint predictable.

## Testing Strategy

- Unit tests for timeline and range normalization logic.
- Type-level tests (`*.type.ts`) for utility contracts where useful.
- Integration tests for ffmpeg command builder outputs.
- Smoke test for IPC handlers (validation + happy path).

## Phased Delivery

Phase 0 (current):
- Tooling baseline and contributor workflow.

Phase 1:
- Single-file load, multi-range selection, batch export, queue UI.

Phase 2:
- Source-folder library, richer timeline interaction, resume/retry improvements.

Phase 3:
- Optional hardware acceleration presets, richer format presets, platform polish.
