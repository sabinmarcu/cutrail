# Distribution and Publishing Plan

## Distribution Goals

Ship cutrail through:
- GitHub Releases for direct downloads (portable and installer-style artifacts).
- AUR for Arch Linux users.

This dual path keeps friction low for both "download and run" users and system-package users.

## Option A: GitHub Releases Artifacts

### Why

- Fast path for multi-platform distribution.
- Good fit for CI-generated release assets.
- Works well with Electron packaging tools.

### Packaging tool choices

1. Electron Forge
- Strong developer workflow from app scaffolding to make/publish.
- Explicit docs mention packaging requires `node_modules` on disk (important with Yarn PnP projects).

2. electron-builder
- Strong cross-platform installer support and updater ecosystem.
- Commonly used for AppImage/deb/rpm and NSIS/DMG pipelines.

### Recommendation

Start with one tool only to reduce operational complexity.

Given the current repo uses Yarn 4 with `nodeLinker: node-modules`:
- Packaging tools that expect on-disk `node_modules` are compatible by default.
- Keep packaging validation in CI to catch regressions early.

### Linux artifacts to target first

- AppImage (portable, no root install)
- `deb` and/or `rpm` (if distro package installs are desired outside AUR)

For Arch-first users, AppImage + AUR is usually sufficient initially.

## Option B: AUR Package

### Why

- Native Arch installation flow.
- Easy upgrades with AUR helper or manual `makepkg` flow.
- Improves discoverability for Arch users.

### Package naming and variants

Recommended AUR package set:

- `cutrail` - source-built package that tracks tagged GitHub releases
- `cutrail-bin` - prebuilt AppImage package that tracks tagged GitHub releases
- `cutrail-git` - rolling package that tracks the `master` branch

Follow AUR naming guidelines:
- `-bin` for prebuilt upstream artifacts.
- `-git` for VCS packages.
- `cutrail-bin` requires `fuse2` on Arch because it installs an AppImage.

### Submission checklist (important)

- Ensure package does not duplicate official repos.
- Include `PKGBUILD` and generated `.SRCINFO` in AUR push.
- Regenerate `.SRCINFO` on metadata changes.
- Use `x86_64` support.
- Add license information for package sources.
- Keep maintainer metadata at top of `PKGBUILD`.

### Publishing workflow (maintainer side)

1. Prepare `PKGBUILD` and helper files.
2. Run `makepkg --printsrcinfo > .SRCINFO`.
3. Commit `PKGBUILD` + `.SRCINFO`.
4. Push to `ssh://aur@aur.archlinux.org/<pkgbase>.git`.

## CI/CD Strategy

## Recommended release engine

For stable releases, prefer a Conventional-Commit-aware GitHub-native release flow that updates `CHANGELOG.md` and creates GitHub Releases from the same commit history.

Current recommendation:

- Use Release Please for stable versioning and changelog generation.
- Keep preview/prerelease build publication as a separate lightweight workflow.
- Treat changelog inclusion in GitHub Releases as mandatory.

Implementation guidance:

- Release Please should own stable changelog generation, stable version bumping, and stable GitHub Release creation.
- Packaging workflows should attach artifacts to the GitHub Release created by the stable release engine rather than duplicating release-note generation themselves.
- Preview workflows should not bypass the stable release policy by pretending to be stable releases.

## GitHub Actions release flow

- Stable release PR/tag engine: `.github/workflows/release-please.yml`.
- Packaging trigger: version tag (for example `v0.1.0`) in `.github/workflows/release.yml`.
- Jobs:
  - install deps
  - verify release context
  - build/package
  - attach release artifacts to existing GitHub Release

Artifacts:
- Linux AppImage
- optional `deb`/`rpm`
- checksums file

Release note policy:

- `CHANGELOG.md` must be updated as part of the stable release flow.
- The GitHub Release body must contain generated release notes derived from Conventional Commits.
- Release artifacts should always be attached to the corresponding GitHub Release.

Current implementation shape:

- Release Please owns stable version bumps, `CHANGELOG.md`, and release note generation.
- The tag-driven release workflow uploads packaged artifacts and updater metadata to the already-created release.

## AUR sync flow

The repository keeps a split workflow model design, but AUR automation is temporarily disabled while AUR registrations are closed.

1. GitHub Release assets are published from the stable tag workflow.
2. The AUR workflow has been renamed to `.github/workflows/aur-packages.disabled.yml` so it does not run.
3. Re-enabling it restores release-driven updates for `cutrail`/`cutrail-bin` and rolling updates for `cutrail-git`.
4. Maintainers still need to provision the AUR SSH key and approve the first publication run when re-enabled.
5. The disabled workflow now includes a release-asset existence check before it attempts AUR pushes.

Local package testing lives in [docs/aur-packaging.md](docs/aur-packaging.md).

## Auto-update strategy

For GitHub-release-installed binaries, the most promising long-term path is an Electron-native self-update flow based on `electron-builder` packaging and `electron-updater`, because it supports Linux targets including AppImage, rpm, and deb.

Current implementation status:
- In-app updater checks are now wired in the Electron main process for packaged builds.
- Linux self-updates are enabled only when running as AppImage.
- AUR/system-managed installs should keep updates package-manager-driven.

For AUR installs, updates should remain package-manager-driven. The application should not try to replace files owned by the system package manager.

The simpler `update.electronjs.org` plus `update-electron-app` path is useful to know about, but it is primarily a macOS/Windows solution and is not sufficient as the primary updater plan for a Linux-first app.

## Suggested Rollout

1. Phase 0:
- Prove packaging locally or in CI.
- Add preview GitHub Releases with AppImage artifacts for iteration sharing.

2. Phase 1:
- Add `cutrail-bin` as the first Arch install path once the GitHub artifact naming, checksum flow, and install expectations are stable enough.
- Keep the update flow semi-manual while the MVP release contract settles.

3. Phase 2:
- Add source-based AUR package (`cutrail`) if build chain is stable.
- Add optional Windows/macOS assets.

4. Phase 3 and beyond:
- Add auto-update strategy for non-AUR installs when release behavior is stable.
- Keep AUR as package-manager-native path for Arch users.

## Risks and Mitigations

- Tooling mismatch with Yarn/Electron packaging expectations.
  - Mitigation: keep `nodeLinker: node-modules` and validate packaging in CI immediately after Electron scaffold.
- ffmpeg runtime availability differences across distributions.
  - Mitigation: document dependency expectations and package variants clearly.
- AUR metadata drift (`PKGBUILD` vs `.SRCINFO`).
  - Mitigation: enforce regeneration in release checklist.
