# Changelog

## [0.8.0](https://github.com/sabinmarcu/cutrail/compare/v0.7.3...v0.8.0) (2026-07-11)


### Features

* **menu:** add shared window menu with platform labels and vim nav ([2221ffd](https://github.com/sabinmarcu/cutrail/commit/2221ffd372aa5bacc772cb87d8cec76f2954fd33))
* **window:** hide custom decoration in fullscreen ([24c5bf3](https://github.com/sabinmarcu/cutrail/commit/24c5bf3db4458249a738cb24d3bf9d8060e5102a))

## [0.7.3](https://github.com/sabinmarcu/cutrail/compare/v0.7.2...v0.7.3) (2026-07-11)


### Bug Fixes

* **editor:** mute hidden default audio track on startup ([8a4922e](https://github.com/sabinmarcu/cutrail/commit/8a4922e0231662cfc180c9a3f827f236b74dddab))

## [0.7.2](https://github.com/sabinmarcu/cutrail/compare/v0.7.1...v0.7.2) (2026-07-11)


### Bug Fixes

* trigger release-please patch release ([f118c1c](https://github.com/sabinmarcu/cutrail/commit/f118c1c3ef511c5e1b531534a266ef3c05b0679f))

## [0.7.1](https://github.com/sabinmarcu/cutrail/compare/v0.7.0...v0.7.1) (2026-07-11)


### Bug Fixes

* **ci:** align scripts with ts runtime and lint rules ([dff2d61](https://github.com/sabinmarcu/cutrail/commit/dff2d612a88d2e5a193d0c2c5ff2304d98c39f3e))

## [0.7.0](https://github.com/sabinmarcu/cutrail/compare/v0.6.0...v0.7.0) (2026-07-10)


### Features

* add multi-track audio timeline and export support ([a05c712](https://github.com/sabinmarcu/cutrail/commit/a05c712c968c27a3edda45f88dfe74259800b7e0))


### Bug Fixes

* **renderer:** restore playback frame scanline layering ([e18ff9d](https://github.com/sabinmarcu/cutrail/commit/e18ff9d4633cc46500c803d30320f5b4d0281628))

## [0.6.0](https://github.com/sabinmarcu/cutrail/compare/v0.5.0...v0.6.0) (2026-07-10)


### Features

* **library:** add source-driven video library window and saved controls ([0f72b51](https://github.com/sabinmarcu/cutrail/commit/0f72b518747cfea90f92e2ceafc53f05930f1b0b))
* **library:** style new/clip states and persist seen tracking ([6f371e5](https://github.com/sabinmarcu/cutrail/commit/6f371e59ddc5934ac9d9e8c9e5c1b3d075940e69))
* **options:** add persisted startup window selection ([eef16fd](https://github.com/sabinmarcu/cutrail/commit/eef16fd68a151cb5ea00490b31add99dd146b053))
* sync generated clips with editor timeline ([8e54f64](https://github.com/sabinmarcu/cutrail/commit/8e54f64145fc929b83721cb48c77ac06a7399a69))

## [0.5.0](https://github.com/sabinmarcu/cutrail/compare/v0.4.0...v0.5.0) (2026-07-10)


### Features

* **editor:** add generated clip actions and reveal fallbacks ([b0fb4e4](https://github.com/sabinmarcu/cutrail/commit/b0fb4e4f33b8a2813e71b9a3578d516345b5ce05))
* **editor:** preview exported clips ([c100291](https://github.com/sabinmarcu/cutrail/commit/c1002913905419b8eff048e1f0668aa8dceb5937))

## [0.4.0](https://github.com/sabinmarcu/cutrail/compare/v0.3.0...v0.4.0) (2026-07-09)


### Features

* **about:** add app metadata details to about window ([7b5e563](https://github.com/sabinmarcu/cutrail/commit/7b5e56321f41e02be6a6820870ac7aafdcb93e63))
* **appimage:** improve standalone install flow and dev run script ([60f74e9](https://github.com/sabinmarcu/cutrail/commit/60f74e99416872a62cc8979a1efc02019d841aa8))
* **renderer:** keep updates flow in one window ([65c83d3](https://github.com/sabinmarcu/cutrail/commit/65c83d350f5a308e0c63aee58363ef5e9407edc3))


### Bug Fixes

* **packaging:** include third-party notices in appimage builds ([c36fb7f](https://github.com/sabinmarcu/cutrail/commit/c36fb7f1537063671220832caabd0eeccb3be8e5))
* **renderer:** render licenses notices markdown ([9b78b2e](https://github.com/sabinmarcu/cutrail/commit/9b78b2e34ed6220295f5c4e86821c10361926b48))

## [0.3.0](https://github.com/sabinmarcu/cutrail/compare/v0.2.0...v0.3.0) (2026-07-08)


### Features

* **linux:** add standalone AppImage install/uninstall launcher actions ([b6a9eba](https://github.com/sabinmarcu/cutrail/commit/b6a9eba8fa75db5246272d3c139cf5503e6f2c57))


### Bug Fixes

* **app:** restore splash drag and full drop-zone behavior ([0475c07](https://github.com/sabinmarcu/cutrail/commit/0475c07d29ba90764396adc5c8230977b40b6786))
* **main:** refresh standalone menu state after install or uninstall ([e7ee0a7](https://github.com/sabinmarcu/cutrail/commit/e7ee0a70c9e1114ef8cddf16dd6b5132152b0b07))

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
