# Build Guide

This guide explains how to build Cutrail from source and generate Linux AppImage artifacts locally.

## Prerequisites

- Linux, macOS, or Windows development machine
- `proto` installed
- Git
- Node and Yarn installed through `proto` (repo pins Node 22 and Yarn 4)

Optional for AUR packaging maintenance:

- `makepkg`
- `pkgctl`

## Clone And Install

1. Clone and enter the repository:

```bash
git clone <repository-url>
cd cutrail
```

2. Install toolchain versions from `.prototools`:

```bash
proto install
```

3. Install dependencies:

```bash
yarn install
```

## Local Development

Run renderer + Electron in development mode:

```bash
yarn dev
```

## Quality Checks

Run autofix first, then strict checks:

```bash
yarn lint:fix
yarn lint
yarn typecheck
yarn test
```

## Build Renderer And Desktop Bundles

Build renderer assets:

```bash
yarn build
```

Build unpacked Electron bundle:

```bash
yarn package
```

Build distributable artifacts for configured targets:

```bash
yarn dist
```

## Build Linux AppImage Locally

Build only the Linux AppImage artifact:

```bash
yarn dist:appimage
```

Expected output location:

- `dist/` (Electron Builder output folder)

## AUR Packaging Skeleton (cutrail-bin)

Repository packaging files live at:

- `packaging/aur/cutrail-bin/PKGBUILD`
- `packaging/aur/cutrail-bin/.SRCINFO`

When release URL/version/checksum changes, regenerate `.SRCINFO`:

```bash
yarn aur:printsrcinfo
```

Use `makepkg -si` from `packaging/aur/cutrail-bin` for local Arch validation.
