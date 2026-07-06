#!/usr/bin/env node

import fs from 'node:fs/promises';

const rawTag = process.env.TAG_NAME ?? process.argv[2] ?? '';
const tagName = String(rawTag).trim();

if (tagName.length === 0) {
  console.error('TAG_NAME is required (example: v0.1.0).');
  process.exit(1);
}

const normalizedTagVersion = tagName.replace(/^v/, '');

if (!/^\d+\.\d+\.\d+([-.].+)?$/.test(normalizedTagVersion)) {
  console.error(`Tag ${tagName} is not a valid semver-like release tag.`);
  process.exit(1);
}

const packageJsonPath = new URL('../package.json', import.meta.url);
const packageJsonRaw = await fs.readFile(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonRaw);
const packageVersion = String(packageJson.version ?? '').trim();

if (packageVersion.length === 0) {
  console.error('package.json version is missing.');
  process.exit(1);
}

if (packageVersion !== normalizedTagVersion) {
  console.error(`Tag/version mismatch: tag=${normalizedTagVersion}, package.json=${packageVersion}`);
  process.exit(1);
}

console.log(`Tag/version check passed: ${tagName} -> ${packageVersion}`);
