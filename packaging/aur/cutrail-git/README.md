# cutrail-git (AUR)

This folder contains the rolling AUR packaging skeleton for `cutrail-git`.

## Expected Source

- Source repository: `https://github.com/sabinmarcu/cutrail.git`
- Branch tracked by the package: `master`
- Runtime dependency: `fuse2` is required on Arch to run the packaged AppImage.

## Local Testing

1. Install Arch packaging prerequisites:

```bash
sudo pacman -S --needed base-devel git fuse2 nodejs yarn
```

2. Build and install locally:

```bash
cd packaging/aur/cutrail-git
makepkg -si
```

3. Regenerate `.SRCINFO` after changing `PKGBUILD`:

```bash
makepkg --printsrcinfo > .SRCINFO
```

## Notes

- The package is intended to mirror the rolling `master` branch.
- The local build produces an AppImage during packaging, so the install path stays aligned with the release packages.