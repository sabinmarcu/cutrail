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
2. Bundled ffmpeg binary from `@ffmpeg-installer/ffmpeg`
3. System `ffmpeg` from `PATH` (fallback)

### Bundled binary source used by this repository

The current bundled package chain is:
- `@ffmpeg-installer/ffmpeg` (declares `LGPL-2.1`)
- Platform package for Linux x64: `@ffmpeg-installer/linux-x64`

Observed package metadata (installed dependency):
- `@ffmpeg-installer/linux-x64` license: `GPLv3`
- Homepage/source: https://www.johnvansickle.com/ffmpeg/

### Compliance notes

- Non-commercial use does not remove license obligations.
- If a distributed FFmpeg binary is GPL-licensed, distribution must comply with GPL terms for that binary distribution.
- If a distributed FFmpeg binary is LGPL-licensed, follow FFmpeg LGPL guidance (including attribution and source-offer requirements where applicable).
- This repository includes in-app attribution and this notice file to improve transparency, but maintainers are still responsible for final distribution compliance.

### Suggested release-time checks

- Confirm license metadata for each platform-specific bundled ffmpeg package.
- Keep attribution text in-app and in-repo.
- Keep source and build provenance links for the exact bundled ffmpeg artifacts.

This document is for engineering documentation and is not legal advice.
