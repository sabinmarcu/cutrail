# Third-Party Notices

This file documents third-party components that are bundled or used at runtime.

## FFmpeg

- Project: FFmpeg
- Website: https://ffmpeg.org/
- Legal page: https://ffmpeg.org/legal.html
- Upstream license model: LGPL-2.1-or-later, with optional components that can make a build GPL-licensed.

### How cutrail uses FFmpeg

cutrail executes the ffmpeg CLI as an external process for clip export.

Runtime resolution order:
1. `CUTRAIL_FFMPEG_PATH` environment override
2. System `ffmpeg` from `PATH`
3. Bundled ffmpeg binary from `@ffmpeg-installer/ffmpeg`

### Bundled binary source used by this repository

The current bundled package chain is:
- `@ffmpeg-installer/ffmpeg` (declares `LGPL-2.1`)
- Platform package for Linux x64: `@ffmpeg-installer/linux-x64`

Observed package metadata (installed dependency):
- `@ffmpeg-installer/linux-x64` license: `GPLv3`
- Homepage/source: https://www.johnvansickle.com/ffmpeg/

## FFprobe

- Project: FFprobe (part of FFmpeg)
- Website: https://ffmpeg.org/
- Legal page: https://ffmpeg.org/legal.html
- Upstream license model: LGPL-2.1-or-later, with optional components that can make a build GPL-licensed.

### How cutrail uses FFprobe

cutrail executes the ffprobe CLI as an external process for source metadata reads and keyframe analysis.

Runtime resolution order:
1. System `ffprobe` from `PATH`
2. Bundled ffprobe binary in the resolved ffmpeg directory (`ffprobe` beside resolved `ffmpeg`)
3. Bundled ffprobe binary from `@ffprobe-installer/ffprobe`

### Resolution mode controls

The Options window exposes `auto`, `bundled`, and `local` switches for both ffmpeg and ffprobe resolution.
Auto uses the runtime order above; bundled and local bias toward their named source first.

### Bundled binary source used by this repository

The current bundled package chain is:
- `@ffprobe-installer/ffprobe` (declares `LGPL-2.1`)
- Platform package for Linux x64: `@ffprobe-installer/linux-x64`

Observed package metadata (installed dependency):
- `@ffprobe-installer/linux-x64` license: `GPL-3.0`
- Homepage/source: https://www.johnvansickle.com/ffmpeg/

### Compliance notes

- Non-commercial use does not remove license obligations.
- If a distributed FFmpeg/FFprobe binary is GPL-licensed, distribution must comply with GPL terms for that binary distribution.
- If a distributed FFmpeg/FFprobe binary is LGPL-licensed, follow FFmpeg LGPL guidance (including attribution and source-offer requirements where applicable).
- This repository includes in-app attribution and this notice file to improve transparency, but maintainers are still responsible for final distribution compliance.

### Suggested release-time checks

- Confirm license metadata for each platform-specific bundled ffmpeg and ffprobe package.
- Keep attribution text in-app and in-repo.
- Keep source and build provenance links for the exact bundled ffmpeg/ffprobe artifacts.

This document is for engineering documentation and is not legal advice.
