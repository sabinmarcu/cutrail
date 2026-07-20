# Changelog

## [0.12.0](https://github.com/sabinmarcu/cutrail/compare/v0.11.0...v0.12.0) (2026-07-20)


### Features

* **app:** add rotating typewriter hints on splash ([055b8fe](https://github.com/sabinmarcu/cutrail/commit/055b8fedd956547133f7ca20d50c482d66d5afb1))
* **menu:** add Start Page file action ([661e7ee](https://github.com/sabinmarcu/cutrail/commit/661e7ee23eabfdc0644c1b5420a5fe80ebe216d0))
* **options:** add default trim mode and apply to new variants ([afe64c2](https://github.com/sabinmarcu/cutrail/commit/afe64c2f7f9998ee5303378177987f11d8df7e8d))
* **options:** refine binary diagnostics and controls ([d1c29ab](https://github.com/sabinmarcu/cutrail/commit/d1c29abf2a16ffe2f533955b4022abf8c0841f74))
* **packaging:** add OS file associations for supported videos ([302d9e6](https://github.com/sabinmarcu/cutrail/commit/302d9e62e0774374a4c560686afadba7f3c7d115))


### Bug Fixes

* **aur:** keep cutrail-bin AppImage intact ([dbfa99c](https://github.com/sabinmarcu/cutrail/commit/dbfa99ca38d261d030f7045661dedd7755028770))
* **clipping:** stabilize variant lifecycle and cleanup debug instrumentation ([c74b475](https://github.com/sabinmarcu/cutrail/commit/c74b475f7931b9d8e8188fdf38ab54b1ea132487))
* **export:** default quick trims for new plans ([174514f](https://github.com/sabinmarcu/cutrail/commit/174514fddb5827bd0360c1eeed22a8715043c2ca))
* **export:** stabilize quick trim compatibility ([65ef8ae](https://github.com/sabinmarcu/cutrail/commit/65ef8ae165bcb2833c5423fceec9f40c0d7f056b))
* **library:** restore select filters ([f7816db](https://github.com/sabinmarcu/cutrail/commit/f7816db4c6930e1c059b02af78ff8e0e120a612a))
* **lint:** resolve autofix leftovers ([fa381a1](https://github.com/sabinmarcu/cutrail/commit/fa381a1cd292fda3c0df6117d720400905f0f74e))
* **renderer:** render splash and about logos via currentColor svg ([428ca97](https://github.com/sabinmarcu/cutrail/commit/428ca9767b24b1f2b6c15b80b1b6c9f324608798))
* tighten library list windowing ([e27288d](https://github.com/sabinmarcu/cutrail/commit/e27288da19b251363bdea8cf9cbba251e055455a))
* **window:** add escape fullscreen exit ([4341128](https://github.com/sabinmarcu/cutrail/commit/4341128499300e848cd19a23dddb8020f657f2d5))

## [0.11.0](https://github.com/sabinmarcu/cutrail/compare/v0.10.1...v0.11.0) (2026-07-20)


### Features

* **editor:** complete phase-3 watcher-driven revamp and status UX ([f580466](https://github.com/sabinmarcu/cutrail/commit/f58046678fffe5d2c6cb99e1839ef82993a4e207))
* **editor:** refine clip card preview controls and exporting progress UI ([5aff65b](https://github.com/sabinmarcu/cutrail/commit/5aff65b995f83d613dcfdb4b25cb5e3903c29135))
* **export:** add phase-0 metadata contracts and identity schemas ([c1d8263](https://github.com/sabinmarcu/cutrail/commit/c1d8263ab16d5de346cef6eec64401aa4f4d0619))
* **export:** embed cutrail metadata in ffmpeg outputs ([44d09d8](https://github.com/sabinmarcu/cutrail/commit/44d09d8480a7948e267e24b2c1e89301f32c767b))
* **phase4:** complete migration validation and watcher hardening ([3d54cf2](https://github.com/sabinmarcu/cutrail/commit/3d54cf296e9456859c1245ff2b874fed148b86ef))
* **sync:** use metadata-first clip readback for editor and library ([b385828](https://github.com/sabinmarcu/cutrail/commit/b385828ae0d84c65af6a7407f43ee5ed11b038cc))


### Bug Fixes

* **pr:** address copilot review findings ([68dbdd1](https://github.com/sabinmarcu/cutrail/commit/68dbdd1f34da1ec3efb4e7a11e64262c90ae343a))

## [0.10.1](https://github.com/sabinmarcu/cutrail/compare/v0.10.0...v0.10.1) (2026-07-19)


### Bug Fixes

* **ci:** harden AUR SSH auth and access preflight ([fe021bc](https://github.com/sabinmarcu/cutrail/commit/fe021bc8e2cf969ab3b1f74a05d8fb038865b238))
* **main:** ensure export output directory exists before export ([e1c01b8](https://github.com/sabinmarcu/cutrail/commit/e1c01b8e85ade83b62074c640f4436a892907f07))

## [0.10.0](https://github.com/sabinmarcu/cutrail/compare/v0.9.0...v0.10.0) (2026-07-12)


### Features

* **renderer:** add theme color reset button in options ([e75dc2c](https://github.com/sabinmarcu/cutrail/commit/e75dc2c93a2f2e324e6113e0c72ac1fd6c95e183))
* **renderer:** refine editor video preview controls ([e652f50](https://github.com/sabinmarcu/cutrail/commit/e652f50e7352a8d2d9be8fed3d71350d9c25e03d))


### Bug Fixes

* **main:** use native fullscreen for window controls ([e404289](https://github.com/sabinmarcu/cutrail/commit/e4042896334b0df68400a721754af751dd527a67))
* **renderer:** anchor editor controls to content at bottom ([37423c0](https://github.com/sabinmarcu/cutrail/commit/37423c0390e917e1045392c4f626f745b378daaf))
* **renderer:** propagate primary color across surfaces and fullscreen layout ([48d4263](https://github.com/sabinmarcu/cutrail/commit/48d42639faade32351d4d7f12fea84823175f08f))
* **renderer:** reduce editor playback stutter in multi-track preview ([d8276d0](https://github.com/sabinmarcu/cutrail/commit/d8276d06f0de8300c8e00adbc8a6f5ebac3cdbc3))

## [0.9.0](https://github.com/sabinmarcu/cutrail/compare/v0.8.0...v0.9.0) (2026-07-11)


### Features

* **theme:** add live primary color picker and runtime propagation ([33f9b06](https://github.com/sabinmarcu/cutrail/commit/33f9b06ee74272bf1c3305fa4d6a213852283a01))
* **updates:** show latest and previous changelogs ([971a1d9](https://github.com/sabinmarcu/cutrail/commit/971a1d9cb81ba567a76ca18a69def43c76cee6ee))

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
