# Publishing Access And Manual Steps

## Purpose

This document captures the small set of publishing tasks that must be done by a maintainer or contributor with the required external accounts and permissions.

Agents can prepare workflows, packaging files, and release documentation, but they cannot create outside accounts, approve repository settings, manage secrets safely, or authenticate to third-party services on your behalf.

## One-Time Setup Checklist

Use this as the exact maintainer checklist before enabling automated releases.

### GitHub repository access

You need:

- admin access or equivalent repository settings access
- permission to edit GitHub Actions settings
- permission to create repository secrets and variables

### AUR access

You need:

- an AUR account
- an SSH key registered with AUR
- permission to publish the chosen package namespace

### Local tools for maintainer-only publishing work

Install or confirm availability of:

- `git`
- `ssh`
- `makepkg` and `pkgctl` or equivalent Arch packaging tools if validating AUR locally

## Recommended Early Strategy

For the current stage of cutrail, the lowest-friction path is:

1. Automate preview GitHub Releases first.
2. Produce a Linux AppImage as the first downloadable artifact.
3. Add `cutrail-bin` in Phase 1 after the release artifact name, versioning scheme, and checksum flow are stable.

That split matches the user base well:

- GitHub prereleases give immediate iteration visibility.
- AUR `-bin` gives Arch users a native install path without forcing source builds too early.

## What Should Be Automated

The repository should eventually automate:

- lint and test in GitHub Actions
- packaging on version tag or prerelease tag
- changelog generation for stable releases
- GitHub Release creation and artifact upload
- checksum generation
- preparation of AUR packaging updates in-repo or in a mirrored packaging repo

The repository should avoid fully unattended AUR publishing until packaging and metadata have settled.

## One-Time Manual Steps For GitHub Releases

### Access requirements

- GitHub repository write or admin access
- permission to edit repository Actions settings

### Required human actions

1. Open the repository on GitHub.
2. Go to `Settings -> Actions -> General`.
3. Confirm GitHub Actions is enabled for the repository.
4. In the same Actions settings page, set workflow permissions so `GITHUB_TOKEN` has read and write access if the workflows will create or edit releases.
5. Decide whether stable releases are triggered only from Release Please merges or whether prerelease workflows will also create GitHub Releases.
6. If using Release Please through GitHub Actions, confirm the app or workflow you choose is permitted in the repository.
7. If later adding signing, notarization, or external publish credentials, create the required secrets in `Settings -> Secrets and variables -> Actions`.
8. Review the first automated release run and confirm:
	- the tag is correct
	- `CHANGELOG.md` is updated as expected
	- the GitHub Release body contains generated notes
	- the release artifacts and checksum files are attached correctly

### Recommended GitHub settings decisions

Make these decisions once and document them in the repo:

- default branch used for stable releases
- whether PRs should be squash-merged by default
- preview tag naming pattern
- stable tag naming pattern, expected to remain `v<semver>` unless changed intentionally

### Release Please one-time approval steps

If Release Please is adopted:

1. Decide whether to use the Release Please GitHub Action or GitHub App.
2. If using the Action, review the workflow file once it is added and confirm repository permissions are sufficient.
3. If using the App, install it for the repository and confirm it has access to the correct repository scope.
4. Review the first release PR manually before merging it.
5. Create repository secret `RELEASE_PLEASE_TOKEN` and use it in `.github/workflows/release-please.yml`.

Recommended token model for this repository:

- Use a fine-grained personal access token scoped to repository `sabinmarcu/cutrail`.
- Grant repository permissions:
	- Contents: Read and write
	- Pull requests: Read and write
	- Workflows: Read and write
- Store it as Actions secret `RELEASE_PLEASE_TOKEN`.

### Notes

- For same-repository GitHub Releases, a dedicated personal access token is often unnecessary if `GITHUB_TOKEN` permissions are configured correctly.
- With Release Please enabled, stable tags are created by the Release Please workflow after the release PR is merged.
- The tag-driven release workflow should focus on packaging and artifact attachment rather than release-note generation.

## One-Time Manual Steps For AUR

### Access requirements

- AUR account for the maintainer
- SSH key registered with the AUR account
- ability to reserve and publish the package namespace

### Required human actions

1. Create or use an existing AUR account.
2. Generate an SSH key intended for AUR publishing if one does not already exist.
3. Add the public key to the AUR account.
4. Verify the intended package name is available, with `cutrail-bin` as the preferred first package.
5. Clone the empty or newly created AUR repository for the selected package name.
6. Perform the initial push to the AUR repository to establish the package.
7. Add the private SSH key as a GitHub Actions secret named `AUR_SSH_PRIVATE_KEY` if CI will publish AUR updates.
8. Optionally add the AUR host key block as `AUR_KNOWN_HOSTS` to pin `aur.archlinux.org`.

### Exact AUR setup sequence

Use a maintainer machine for these steps:

1. Generate a dedicated SSH key if needed:
	- `ssh-keygen -t ed25519 -C "aur-cutrail"`
2. Copy the public key contents.
3. Add that key in the AUR web interface under account SSH keys.
4. Verify repository access with a test SSH connection if desired.
5. Clone the package repository after reserving the package name:
	- `git clone ssh://aur@aur.archlinux.org/cutrail-bin.git`
6. Commit the initial `PKGBUILD` and `.SRCINFO`.
7. Push the initial package state.

### AUR automation approval decision

Before enabling any CI write access to AUR, explicitly decide:

- whether CI should publish `cutrail`, `cutrail-bin`, and `cutrail-git`
- whether `cutrail-git` should stay on the rolling `master` branch only
- who is allowed to rotate the AUR deploy key

### Notes

- The first AUR package should be `cutrail-bin`, not the source-build package.
- Keeping AUR publishing semi-manual early is safer while artifact names, versioning, and checksums may still change.

## Minimal Human Actions Per Release

If the repository automation is set up well, the routine release flow can stay small.

### GitHub prerelease or release

1. Confirm the release-worthy commit is on the intended branch.
2. If using Release Please, review and merge the release PR for stable releases.
3. If using preview tags, create and push the prerelease tag.
4. Watch the workflow and confirm artifacts were uploaded successfully.
5. Sanity-check the published AppImage and checksums.
6. Confirm the release notes include the generated changelog content.

### AUR `cutrail-bin`

1. Confirm the GitHub release artifact URL and checksum.
2. Review the generated or updated `PKGBUILD` and `.SRCINFO`.
3. Let the AUR workflow push the update after the release workflow succeeds.
4. Verify installation with an AUR helper or `makepkg` flow.

See [docs/aur-packaging.md](docs/aur-packaging.md) for local package testing instructions.

## One-Time Setup For Future In-App Updates

This is not needed immediately, but the one-time maintainer concerns should be recorded now.

### GitHub-release-installed binaries

When the updater is implemented later, maintainers will need to:

1. Decide the final packaged formats that should self-update.
2. Confirm the chosen packaging tool emits the metadata required by the updater path.
3. Keep artifact naming stable across releases.
4. Validate that the updater only runs in packaged builds, not development.

### AUR-installed binaries

When the updater is implemented later, maintainers will need to:

1. Decide how the app detects package-managed installs.
2. Verify that in-app self-update is disabled for AUR builds.
3. Document that AUR users should update through their package manager.

## What Agents Can Prepare Ahead Of Time

Agents can do all of the following before a maintainer touches external systems:

- create GitHub Actions workflows
- create Release Please configuration
- add packaging configuration
- add checksum generation
- prepare `PKGBUILD` templates and `.SRCINFO` generation steps
- document release and rollback flow
- add validation scripts and release checklists

## Suggested Policy For This Repository

- Phase 0 should include preview GitHub Release automation once packaging proof-of-life exists.
- Phase 1 should add `cutrail-bin` as the first AUR package once the artifact contract is stable enough to avoid churn.
- Stable releases should include generated changelog content in both the repository and the GitHub Release body.
- Phase 4 should harden and formalize the publishing path rather than introduce it for the first time.