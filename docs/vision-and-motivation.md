# Vision and Motivation

## Product Name

Chosen product name: **cutrail**

Why this name:
- "cut" states the core action clearly.
- "rail" reflects a guided, timeline-like workflow for selecting ranges.
- Short, memorable, and easy to type.
- Distinct from generic "video editor" naming.
- Fits an Arch/AUR-friendly package naming style (`cutrail`).

Alternative candidates:
- `clipweaver`
- `trimforge`

## Product Vision

cutrail is a focused desktop app for making clean clips from longer recordings with minimal friction:
- Point to an input folder with source videos.
- Pick one video, define one or many time ranges.
- Export all clips in one batch into an output folder.

The app is intentionally narrow in scope: fast clip extraction, predictable outputs, and no heavyweight timeline editing complexity.

## Motivation

Current options are often either:
- Too heavy (full NLE workflow for a simple clipping task), or
- Too technical (raw ffmpeg commands and scripts).

cutrail targets the middle ground:
- A practical UI for selection and preview.
- Reliable backend processing using ffmpeg.
- Repeatable workflows for creators who trim often.

## Core User Flow

1. Set source and output folders in app settings.
2. Choose a source video from the in-app list (or open a file directly).
3. Add one or many clip ranges.
4. Review and export.
5. Monitor progress and inspect results.

## Non-Goals (Phase 1)

- Full non-linear editing.
- Effects/compositing.
- Multi-track timeline authoring.
- Cloud sync and collaboration.

## Guiding Principles

- Keep clipping operations explicit and auditable.
- Prefer safe defaults over hidden magic.
- Keep architecture modular so batch engine can be tested independently of UI.
- Stay Linux-first (Arch) without blocking later macOS/Windows builds.
