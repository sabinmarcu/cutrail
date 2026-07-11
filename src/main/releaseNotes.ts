import { readFileSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { normalizeReleaseNotesText } from './releaseNotesFormatting.ts';

type PublishEntry = {
  provider?: unknown;
  owner?: unknown;
  repo?: unknown;
};

type GitHubPublishEntry = {
  provider: 'github';
  owner: string;
  repo: string;
};

type RepositoryReference = {
  owner: string;
  repo: string;
};

type ReleaseNotesEntry = {
  version: string;
  notes: string;
};

type ReleaseNotesBundle = {
  latest: string;
  older: ReleaseNotesEntry[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isGitHubPublishEntry = (entry: unknown): entry is GitHubPublishEntry => {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const publishEntry = entry as PublishEntry;

  return publishEntry.provider === 'github'
    && typeof publishEntry.owner === 'string'
    && typeof publishEntry.repo === 'string';
};

const resolveGitHubRepository = (): RepositoryReference | null => {
  try {
    const packageJsonPath = path.join(app.getAppPath(), 'package.json');
    const packageJsonUnknown = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as unknown;

    if (!isRecord(packageJsonUnknown)) {
      return null;
    }

    const build = isRecord(packageJsonUnknown.build) ? packageJsonUnknown.build : null;
    const publish = build?.publish;
    const publishEntries = [];

    if (Array.isArray(publish)) {
      publishEntries.push(...publish);
    } else if (publish) {
      publishEntries.push(publish);
    }
    const githubPublishEntry = publishEntries.find(
      (entry): entry is GitHubPublishEntry => isGitHubPublishEntry(entry),
    );

    if (githubPublishEntry) {
      return {
        owner: githubPublishEntry.owner,
        repo: githubPublishEntry.repo,
      };
    }

    const { repository } = packageJsonUnknown;
    const repositoryUrl = typeof repository === 'string'
      ? repository
      : (isRecord(repository) ? repository.url : undefined);

    if (typeof repositoryUrl !== 'string') {
      return null;
    }

    const match = repositoryUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/i);

    if (!match) {
      return null;
    }

    const [, owner, repo] = match;

    return {
      owner,
      repo,
    };
  } catch {
    return null;
  }
};

const normalizeVersionTag = (value: string): string => {
  const trimmed = value.trim();

  return trimmed.startsWith('v') ? trimmed.slice(1) : trimmed;
};

const parseReleaseBody = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return normalizeReleaseNotesText(value).trim();
};

const fetchReleaseNotesBundleFromGitHub = async (
  version: string,
): Promise<ReleaseNotesBundle | null> => {
  const repository = resolveGitHubRepository();

  if (!repository) {
    return null;
  }

  const url = `https://api.github.com/repos/${repository.owner}/${repository.repo}/releases?per_page=8`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'cutrail-updater',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json() as unknown;

    if (!Array.isArray(payload) || payload.length === 0) {
      return null;
    }

    const releaseEntries = payload
      .filter((entry) => isRecord(entry))
      .map((entry) => {
        const tagName = typeof entry.tag_name === 'string' ? entry.tag_name : '';

        return {
          version: normalizeVersionTag(tagName),
          notes: parseReleaseBody(entry.body),
        };
      })
      .filter((entry) => entry.version.length > 0);

    if (releaseEntries.length === 0) {
      return null;
    }

    const requestedVersion = normalizeVersionTag(version);
    const matchedIndex = requestedVersion.length > 0
      ? releaseEntries.findIndex((entry) => entry.version === requestedVersion)
      : 0;
    const latestIndex = Math.max(0, matchedIndex);
    const latestEntry = releaseEntries[latestIndex];
    const olderEntries = releaseEntries
      .slice(latestIndex + 1)
      .filter((entry) => entry.notes.length > 0)
      .map((entry) => ({
        version: entry.version,
        notes: entry.notes,
      }));

    return {
      latest: latestEntry.notes,
      older: olderEntries,
    };
  } catch {
    return null;
  }
};

const fetchReleaseNotesFromGitHub = async (version: string): Promise<string | null> => {
  const bundle = await fetchReleaseNotesBundleFromGitHub(version);

  if (!bundle || bundle.latest.length === 0) {
    return null;
  }

  return bundle.latest;
};

export {
  fetchReleaseNotesBundleFromGitHub,
  fetchReleaseNotesFromGitHub,
};
