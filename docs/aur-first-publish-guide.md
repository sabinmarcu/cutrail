# AUR First Publish Guide (with 1Password SSH)

This guide covers the first-time bootstrap for publishing `cutrail`, `cutrail-git`, and `cutrail-bin` to AUR, using 1Password-managed SSH keys.

Status note: automated GitHub Actions publishing is currently paused while AUR registrations are closed. The parked workflow is `.github/workflows/aur-packages.disabled.yml`.

## Prerequisites

- AUR account created at `https://aur.archlinux.org`.
- 1Password desktop app installed and unlocked.
- 1Password SSH agent enabled.
- This repository checked out locally.

## 1) Verify SSH Auth to AUR via 1Password

Run:

```bash
ssh -T aur@aur.archlinux.org
```

Expected result:

- Authentication succeeds.
- AUR responds with a message indicating no shell access (this is normal).

If this fails:

1. Ensure 1Password app is unlocked.
2. Ensure the key item is allowed for SSH agent use.
3. Ensure your shell points at the 1Password SSH agent socket.

## 2) Add Your Public Key to AUR

1. Open AUR account settings.
2. Paste the public key associated with your 1Password SSH key item.
3. Save settings.

## 3) Sync Local AUR Metadata

From repo root:

```bash
yarn aur:sync-toolchain
yarn aur:printsrcinfo
yarn aur:check-toolchain
```

This ensures `PKGBUILD` and `.SRCINFO` are aligned.

## 4) Bootstrap Each AUR Package Repo (First Push)

Do this once for each package:

- `cutrail`
- `cutrail-git`
- `cutrail-bin`

### Example for one package

```bash
mkdir -p ~/tmp/aur-bootstrap
cd ~/tmp/aur-bootstrap
git clone ssh://aur@aur.archlinux.org/cutrail.git
cd cutrail
cp /path/to/repo/packaging/aur/cutrail/PKGBUILD .
cp /path/to/repo/packaging/aur/cutrail/.SRCINFO .
git add PKGBUILD .SRCINFO
git commit -m "Initial AUR import"
git push
```

Repeat for `cutrail-git` and `cutrail-bin` by changing the package name and source paths.

## 5) Validate Package Pages

Check these URLs after push:

- `https://aur.archlinux.org/packages/cutrail`
- `https://aur.archlinux.org/packages/cutrail-git`
- `https://aur.archlinux.org/packages/cutrail-bin`

## 6) CI Automation Setup (GitHub Actions)

The workflow uses these secrets:

- `AUR_SSH_PRIVATE_KEY`
- `AUR_KNOWN_HOSTS`

Recommended approach:

1. Create a dedicated CI SSH key pair for AUR publishing.
2. Store it in 1Password.
3. Add public key to AUR account.
4. Put private key into GitHub `AUR_SSH_PRIVATE_KEY` secret.
5. Put known_hosts for `aur.archlinux.org` into `AUR_KNOWN_HOSTS`.

## 7) Ongoing Publishing Flow

- Automation is currently paused; publish updates manually when needed.
- When re-enabled, `cutrail` and `cutrail-bin` publish from stable release flow.
- When re-enabled, `cutrail-git` publishes from `master` updates.
- Before pushing changes that touch AUR definitions, run:

```bash
yarn aur:sync-toolchain
yarn aur:printsrcinfo
yarn aur:check-toolchain
```

## 8) Current Package Contract

- `cutrail` and `cutrail-git`:
  - Build from source.
  - Run against shared AUR Electron (`electron37`).
  - Install desktop shortcut.
  - Use `proto-bin` for build toolchain setup.
- `cutrail-bin`:
  - Installs prebuilt AppImage from GitHub Release.
  - Depends on `fuse2`.

## Troubleshooting

### Signing or SSH prompt is refused

- Unlock 1Password app.
- Re-run the command and approve the prompt.

### `corepack command not found`

- Not used in current AUR source builds.
- Source builds use `proto install` and `proto exec`.

### `node: not found` when running Yarn in container

- Ensure package build uses:

```bash
proto install
proto exec node yarn -- yarn install --immutable
proto exec node yarn -- yarn build
```

### Packaging fails while stripping/debug indexing large bundled binaries

- Source PKGBUILDs currently disable strip/debug package splitting to avoid this issue.
