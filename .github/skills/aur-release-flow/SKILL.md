---
name: aur-release-flow
description: Update and validate AUR release metadata for cutrail-bin only after the matching GitHub Release has been verified.
version: 1.0.0
owner: Sabin Marcu <sabinmarcu@gmail.com>
discovery:
  keywords:
    - aur release
    - cutrail-bin
    - pkgbuild
    - srcinfo
    - arch packaging
  intents:
    - publish aur update
    - update cutrail-bin
    - prepare aur release
    - sync aur after github release
appliesTo:
  - packaging/aur/cutrail-bin/PKGBUILD
  - packaging/aur/cutrail-bin/.SRCINFO
  - packaging/aur/cutrail-bin/README.md
  - package.json
  - .github/instructions/release-flow.instructions.md
---

# AUR Release Flow Skill

Use this skill to prepare and validate `cutrail-bin` AUR release metadata after a stable GitHub Release is already available.

## Use This Skill When

- A stable GitHub Release tag `vX.Y.Z` has been successfully published.
- You need to update `cutrail-bin` source URL/version metadata for that release.
- You need `.SRCINFO` synchronized with `PKGBUILD`.

## Do Not Use This Skill When

- GitHub Release has not completed successfully yet.
- You are preparing rolling/dev packaging (`cutrail-git`) instead of `cutrail-bin`.
- Release tag/version parity is unknown.

## Required Inputs

- Verified release tag `vX.Y.Z`.
- Release asset URL for `Cutrail-X.Y.Z.AppImage`.
- Target checksum policy (`SKIP` for early phase or pinned sha256 for hardened release flow).

## Procedure

1. Confirm GitHub Release for `vX.Y.Z` exists and asset URL is reachable.
2. Confirm `package.json` version is `X.Y.Z` and aligns with the release tag.
3. Update `packaging/aur/cutrail-bin/PKGBUILD`:
- `pkgver`
- release source URL/version segment
- checksum fields according to current policy
4. Regenerate `.SRCINFO` from `PKGBUILD`.
5. Verify `PKGBUILD` and `.SRCINFO` are aligned on:
- `pkgver`
- `url`
- `source_x86_64`
6. Validate packaging documentation notes if behavior or policy changed.

## Validation Checklist

- GitHub release tag exists and is healthy.
- `PKGBUILD` points to `https://github.com/sabinmarcu/cutrail/releases/download/vX.Y.Z/Cutrail-X.Y.Z.AppImage`.
- `.SRCINFO` matches `PKGBUILD` values.
- AUR update is ready for maintainer push/review.

## Outputs

- Updated `PKGBUILD` and `.SRCINFO` for `cutrail-bin`.
- AUR update payload ready after successful upstream release.

## Guardrails

- Never run this flow before GitHub Release validation.
- Keep `cutrail-bin` on stable release tags only.
- Respect `.github/instructions/release-flow.instructions.md` for version/tag/channel policy.
