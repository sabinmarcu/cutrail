import path from 'node:path';
import fsPromises from 'node:fs/promises';

import {
  describe,
  expect,
  it,
} from 'vitest';

import { runCutrailCli } from './cutrailCli.ts';

const createWritable = () => {
  const chunks: string[] = [];

  return {
    stream: {
      write: (chunk: string): boolean => {
        chunks.push(chunk);

        return true;
      },
    } as unknown as NodeJS.WriteStream,
    toString: (): string => chunks.join(''),
  };
};

describe('runCutrailCli', () => {
  it('starts app without arguments', async () => {
    const stdout = createWritable();
    const stderr = createWritable();

    const result = await runCutrailCli({
      argv: [],
      cwd: process.cwd(),
      stderr: stderr.stream,
      stdout: stdout.stream,
      version: '0.0.0-test',
    });

    expect(result.exitCode).toBe(0);
    expect(result.shouldStartApp).toBe(true);
    expect(result.startupPaths).toEqual([]);
  });

  it('prints version and does not start app', async () => {
    const stdout = createWritable();
    const stderr = createWritable();

    const result = await runCutrailCli({
      argv: ['--version'],
      cwd: process.cwd(),
      stderr: stderr.stream,
      stdout: stdout.stream,
      version: '1.2.3',
    });

    expect(result.exitCode).toBe(0);
    expect(result.shouldStartApp).toBe(false);
    expect(result.startupPaths).toEqual([]);
    expect(stdout.toString()).toContain('1.2.3');
  });

  it('validates provided paths and forwards existing ones', async () => {
    const stdout = createWritable();
    const stderr = createWritable();
    const fixtureDirectory = path.join(process.cwd(), 'logs', 'cli-test-fixtures');
    const firstPath = path.join(fixtureDirectory, 'one.mp4');
    const secondPath = path.join(fixtureDirectory, 'two.mkv');

    await fsPromises.mkdir(fixtureDirectory, { recursive: true });
    await fsPromises.writeFile(firstPath, 'one', 'utf8');
    await fsPromises.writeFile(secondPath, 'two', 'utf8');

    const result = await runCutrailCli({
      argv: [firstPath, secondPath],
      cwd: process.cwd(),
      stderr: stderr.stream,
      stdout: stdout.stream,
      version: '0.0.0-test',
    });

    expect(result.exitCode).toBe(0);
    expect(result.shouldStartApp).toBe(true);
    expect(result.startupPaths).toEqual([firstPath, secondPath]);
  });

  it('returns non-zero when one or more paths are missing', async () => {
    const stdout = createWritable();
    const stderr = createWritable();
    const fixtureDirectory = path.join(process.cwd(), 'logs', 'cli-test-fixtures');
    const firstPath = path.join(fixtureDirectory, 'existing.webm');
    const missingPath = path.join(fixtureDirectory, 'missing.webm');

    await fsPromises.mkdir(fixtureDirectory, { recursive: true });
    await fsPromises.writeFile(firstPath, 'existing', 'utf8');

    const result = await runCutrailCli({
      argv: [firstPath, missingPath],
      cwd: process.cwd(),
      stderr: stderr.stream,
      stdout: stdout.stream,
      version: '0.0.0-test',
    });

    expect(result.exitCode).toBe(1);
    expect(result.shouldStartApp).toBe(false);
    expect(result.startupPaths).toEqual([]);
    expect(stderr.toString()).toContain('Path not found');
  });
});
