# cutrail-bin (AUR)

This folder contains the initial AUR packaging skeleton for `cutrail-bin`.

## Files

- `PKGBUILD`
- `.SRCINFO`

## Expected Release Artifact

The package consumes the GitHub release AppImage artifact:

- `Cutrail-<version>.AppImage`
- URL pattern: `https://github.com/sabinmarcu/video-trimmer/releases/download/v<version>/Cutrail-<version>.AppImage`

## Updating For A New Release

1. Update `pkgver` and source URL in `PKGBUILD`.
2. Replace `sha256sums_x86_64` with the release checksum value (recommended for stable releases).
3. Regenerate `.SRCINFO`:

```bash
proto run yarn -- aur:printsrcinfo
```

4. Validate package build on Arch:

```bash
cd packaging/aur/cutrail-bin
makepkg -si
```
