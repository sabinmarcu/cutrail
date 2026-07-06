---
applyTo: "{.github/workflows/*.{yml,yaml},package.json,packaging/aur/**/*,README.md,BUILD.md,docs/distribution-and-publishing.md,docs/phased-implementation-plan.md,docs/publishing-access-and-manual-steps.md,docs/release-and-update-research.md}"
---

# Release Flow Instructions

Follow these rules as hard requirements for release automation, versioning, and packaging-channel decisions.

## Hard Rules

1. Use SemVer with immutable stable tags.
- Stable tags must be `vX.Y.Z`.
- Stable tags must not be moved or force-updated after publication.

2. Keep release version parity strict.
- `package.json` version must exactly match the stable tag version without `v`.
- Example: tag `v0.2.1` requires `package.json` version `0.2.1`.
- Release workflows must fail if this check does not pass.

3. Keep `main` on a development version.
- Between stable releases, use prerelease development versions (for example `0.3.0-dev.0`).
- Before a stable release, bump to the final stable version in a release-prep change.
- After a stable release, bump immediately to the next development version.

4. Separate stable and rolling channels.
- `cutrail-bin` tracks stable tagged GitHub Releases only.
- `cutrail-git` (when present) tracks rolling `main` and must derive version from git metadata, not stable release tags.

5. Keep release workflows tag-driven.
- GitHub release publication should trigger from tag pushes, not direct branch pushes.
- Release workflows should build platform assets and attach them to the matching tag release.

6. Replace-release behavior is temporary.
- If a workflow currently deletes and recreates an existing release for the same tag, treat this as an early-phase policy only.
- Prefer immutable releases once maintainers finalize release discipline.

7. Keep artifact contracts stable.
- Asset names consumed by external packaging (for example AUR `cutrail-bin`) must stay predictable.
- If artifact naming changes, update AUR packaging files and docs in the same change set.

8. Keep AUR metadata aligned.
- `packaging/aur/cutrail-bin/PKGBUILD` and `.SRCINFO` must agree on URL, version, and source artifact naming.
- Update and regenerate `.SRCINFO` whenever `PKGBUILD` release-source metadata changes.

9. Use direct script commands in user-facing docs.
- In docs intended for users (`README.md`, `BUILD.md`, `CONTRIBUTING.md`), document commands as `yarn ...` scripts.
- Do not present `proto run yarn -- ...` in user-facing command examples.

## Recommended Stable Release Sequence

1. Ensure `main` is releasable and green.
2. Bump `package.json` from `X.Y.Z-dev.N` to `X.Y.Z`.
3. Merge release-prep change.
4. Create tag `vX.Y.Z` on that commit.
5. Let release workflow build and publish artifacts.
6. Bump `main` to next development version.

## Hotfix Sequence

1. Branch from stable tag (for example `vX.Y.Z`).
2. Apply fix and bump to `X.Y.(Z+1)`.
3. Tag `vX.Y.(Z+1)` and publish.
4. Merge/cherry-pick fix back to `main`.

## Governance

- Any change to release/versioning policy must update this file and the related AI docs in the same change set.
- If release automation behavior changes, also update `README.md` release instructions and AUR packaging docs.