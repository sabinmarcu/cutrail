---
name: github-release-flow
description: Create a stable GitHub Release from a SemVer tag, enforcing tag/version parity and the repository release-flow policy.
version: 1.1.0
owner: Sabin Marcu <sabinmarcu@gmail.com>
discovery:
  keywords:
    - github release
    - tag release
    - semver
    - publish binaries
    - release workflow
  intents:
    - create a release
    - publish a tagged release
    - cut stable release
    - create tag and push release
appliesTo:
  - .github/workflows/release.yml
  - package.json
  - scripts/check-tag-version.mjs
  - README.md
  - .github/instructions/release-flow.instructions.md
---

# GitHub Release Flow Skill

Use this skill to publish a stable GitHub Release from a tag while enforcing policy in `.github/instructions/release-flow.instructions.md`.

## Use This Skill When

- You are preparing a stable release (`vX.Y.Z`).
- You need to validate tag/version parity before publishing.
- You want to run the tag-driven release automation safely.

## Do Not Use This Skill When

- You are publishing rolling/dev snapshots from `main`.
- You are updating AUR metadata only (use `aur-release-flow`).

## Required Inputs

- `tag`: stable tag in `vX.Y.Z` format.
- `package.json` version at release commit.

## Procedure

1. Confirm `package.json` version equals tag version without `v`.
2. Confirm release readiness on the commit to be tagged.
3. Create tag `vX.Y.Z` on that commit.
4. Push the tag to origin.
5. Let `.github/workflows/release.yml` execute:
- preflight tag/version check,
- remove existing release for same tag if present (early-phase policy),
- build platform artifacts,
- publish release assets.
6. Verify release assets include expected platform outputs.

## Validation Checklist

- Tag matches `vX.Y.Z`.
- `package.json` version exactly matches `X.Y.Z`.
- Release job succeeded.
- Published assets include Linux, macOS, and Windows deliverables.

## Outputs

- Stable GitHub Release for tag `vX.Y.Z`.
- Attached binaries from current release workflow run.
- Verified release URL ready for downstream packaging updates.

## Guardrails

- Do not move/rewrite published stable tags.
- Treat delete-and-recreate behavior as temporary early-phase policy.
- Keep user-facing docs release commands in direct `yarn ...` style.
