# AUR Packaging

cutrail now publishes three AUR packages:

- `cutrail` - source-built package that tracks tagged GitHub releases
- `cutrail-bin` - prebuilt AppImage package that tracks tagged GitHub releases
- `cutrail-git` - rolling package that tracks the `master` branch

The publish flow is split so stable releases and rolling updates do not share the same branch logic. The release workflow publishes GitHub Release assets, and `.github/workflows/aur-packages.yml` pushes the corresponding AUR updates after that release succeeds.

## Package Notes

- `cutrail-bin` requires `fuse2` on Arch because it installs the upstream AppImage directly.
- `cutrail` and `cutrail-git` are source-built packages that use shared Arch Electron (`electron37`) at runtime and use `proto-bin` during build to provision Node/Yarn from repository toolchain metadata.
- `cutrail-git` also needs `git` as a build dependency because it tracks the rolling repository branch.

## Local Testing

Use an Arch-based environment for the most realistic validation. The local test harness below assumes `yay` is available and uses it to resolve package dependencies from the PKGBUILD metadata. Prefer `podman` for the container harness when it is available; Docker works with the same compose file.

1. Install `yay` on the host if you want to test directly on Arch.

```bash
sudo pacman -S --needed yay
```

2. Test a package directly on Arch with `yay`:

```bash
cd packaging/aur/cutrail
yay -Bi --noconfirm --answerclean None --answerdiff None --answeredit None .
```

3. Test the other packages the same way:

```bash
cd ../cutrail-bin
yay -Bi --noconfirm --answerclean None --answerdiff None --answeredit None .

cd ../cutrail-git
yay -Bi --noconfirm --answerclean None --answerdiff None --answeredit None .
```

4. Regenerate `.SRCINFO` after editing any `PKGBUILD`:

```bash
makepkg --printsrcinfo > .SRCINFO
```

## Isolated Container Harness

Use this path to simulate a fresh Arch setup with only `yay` available. The container image provides the rest of the build toolchain, and Compose runs one package per service so each build stays isolated.

1. Build the harness image and run the package services with Podman Compose:

```bash
podman compose -f docker/aur/compose.yml build
podman compose -f docker/aur/compose.yml run --rm cutrail
podman compose -f docker/aur/compose.yml run --rm cutrail-bin
podman compose -f docker/aur/compose.yml run --rm cutrail-git
```

2. If you prefer Docker, use the same compose file with Docker Compose:

```bash
docker compose -f docker/aur/compose.yml build
docker compose -f docker/aur/compose.yml run --rm cutrail
docker compose -f docker/aur/compose.yml run --rm cutrail-bin
docker compose -f docker/aur/compose.yml run --rm cutrail-git
```

## Container Harness

- `docker/aur/Dockerfile` builds an Arch-based image with `yay` installed.
- `docker/aur/compose.yml` exposes one service per package so each package can be built in isolation.
- The compose services mount the repository read/write so build artifacts land in the workspace the same way they do on a real machine.
- You can run the compose file from the repository root with either `podman compose -f docker/aur/compose.yml ...` or `docker compose -f docker/aur/compose.yml ...`.

## Workflow Inputs

The automated AUR workflow expects these repository secrets:

- `AUR_SSH_PRIVATE_KEY` - SSH private key with AUR push access
- `AUR_KNOWN_HOSTS` - optional pinned `aur.archlinux.org` host key block

If `AUR_KNOWN_HOSTS` is not set, the workflow falls back to `ssh-keyscan aur.archlinux.org`.

## Toolchain Sync Automation

To keep AUR metadata aligned with Electron metadata from `package.json` (`devDependencies.electron`):

- `yarn aur:sync-toolchain` updates `PKGBUILD` and `.SRCINFO` in `cutrail` and `cutrail-git`.
- `yarn aur:check-toolchain` verifies they are already synchronized.
- `.husky/pre-push` runs sync automatically and blocks push if files changed, so toolchain pin updates are committed deliberately.