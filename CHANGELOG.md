# Changelog

## [0.2.0](https://github.com/sabinmarcu/cutrail/compare/v0.1.0...v0.2.0) (2026-07-08)


### Features

* add github-release in-app updater flow ([b57ff07](https://github.com/sabinmarcu/cutrail/commit/b57ff0716353c3ed353424eb3df9cdd7aaccccc9))


### Bug Fixes

* **aur:** stabilize proto-based package builds and publishing flow ([a077cf9](https://github.com/sabinmarcu/cutrail/commit/a077cf988c9eed88d6826304831b59571a245fed))
* fallback to github release notes in updater ([9a6a836](https://github.com/sabinmarcu/cutrail/commit/9a6a83607c471d5792dfd55dc8c9be5f3de29f53))
* use electron-updater cjs interop and update vscode terminal approvals ([180bb5c](https://github.com/sabinmarcu/cutrail/commit/180bb5c6577335f510903259783a3123af2d8a94))

## [0.1.0] (2026-07-06)

### Features

* bootstrap phase 0 electron react shell
* phase-1: deliver single-video clipping MVP
* phase-1: complete MVP polish and packaging baseline
* phase-1: add tag-driven release flow and packaging skills

### Bug Fixes

* app: remove continue usage in splash drop parsing
* ci: attach release assets to tag release
* release: harden publish step and packaged ffmpeg resolution

### CI

* release: publish with electron-builder using `GITHUB_TOKEN`

### Documentation

* phase-1: use direct yarn commands in user docs
* ai: require announcing skill usage

### Chores

* initial repository setup
* phase-1: rebrand repository metadata to cutrail
* phase-1: align CI branch and Linux release targets
