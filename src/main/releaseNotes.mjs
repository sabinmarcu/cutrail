// @ts-check

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

/**
 * @typedef {{
 *   provider?: unknown,
 *   owner?: unknown,
 *   repo?: unknown,
 * }} PublishEntry
 */

/**
 * @param {unknown} entry
 * @returns {entry is { provider: 'github', owner: string, repo: string }}
 */
const isGitHubPublishEntry = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  /** @type {PublishEntry} */
  const publishEntry = entry;

  return publishEntry.provider === 'github'
    && typeof publishEntry.owner === 'string'
    && typeof publishEntry.repo === 'string';
};

/**
 * @returns {{ owner: string, repo: string } | null}
 */
const resolveGitHubRepository = () => {
  try {
    const packageJsonPath = path.join(app.getAppPath(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const publish = packageJson?.build?.publish;
    /** @type {unknown[]} */
    const publishEntries = [];

    if (Array.isArray(publish)) {
      publishEntries.push(...publish);
    } else if (publish) {
      publishEntries.push(publish);
    }
    const githubPublishEntry = publishEntries.find((entry) => isGitHubPublishEntry(entry));

    if (githubPublishEntry) {
      return {
        owner: githubPublishEntry.owner,
        repo: githubPublishEntry.repo,
      };
    }

    const repository = packageJson?.repository;
    const repositoryUrl = typeof repository === 'string'
      ? repository
      : repository?.url;

    if (typeof repositoryUrl !== 'string') {
      return null;
    }

    const match = repositoryUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/i);

    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2],
    };
  } catch {
    return null;
  }
};

/**
 * @param {string} version
 * @returns {Promise<string | null>}
 */
const fetchReleaseNotesFromGitHub = async (version) => {
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

    /** @type {{ body?: unknown }} */
    const payload = await response.json();
    const body = typeof payload.body === 'string'
      ? payload.body.trim()
      : '';

    return body.length > 0 ? body : null;
  } catch {
    return null;
  }
};

export {
  fetchReleaseNotesFromGitHub,
};
