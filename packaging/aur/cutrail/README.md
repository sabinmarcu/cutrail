# cutrail (AUR)

This folder contains the source-built AUR packaging skeleton for `cutrail`.

## Expected Source

- Source archive pattern: `https://github.com/sabinmarcu/cutrail/archive/refs/tags/v<version>.tar.gz`
- Required parity: release tag `v<version>` must match `package.json` version `<version>`.
- Runtime dependency: `fuse2` is required on Arch to run the packaged AppImage.

## Local Testing

1. Install Arch packaging prerequisites:

```bash
sudo pacman -S --needed base-devel git fuse2 nodejs yarn
```

2. Build and install locally:

```bash
cd packaging/aur/cutrail
makepkg -si
```

3. Regenerate `.SRCINFO` after changing `PKGBUILD`:

```bash
makepkg --printsrcinfo > .SRCINFO
```

## Notes

- The package intentionally tracks the stable release tag rather than the rolling branch.
- The local build uses the repository source tree and produces an AppImage during packaging.