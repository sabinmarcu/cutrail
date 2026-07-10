import { readFileSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

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

const fetchReleaseNotesFromGitHub = async (version: string): Promise<string | null> => {
  const repository = resolveGitHubRepository();

  if (!repository) {
    return null;
  }

  const tag = version.startsWith('v') ? version : `v${version}`;
  const url = `https://api.github.com/repos/${repository.owner}/${repository.repo}/releases/tags/${encodeURIComponent(tag)}`;

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
    const payloadBody = isRecord(payload) ? payload.body : undefined;
    const body = typeof payloadBody === 'string'
      ? payloadBody.trim()
      : '';

    return body.length > 0 ? body : null;
  } catch {
    return null;
  }
};

export {
  fetchReleaseNotesFromGitHub,
};
