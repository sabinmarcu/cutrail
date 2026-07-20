import { spawn } from 'node:child_process';
import path from 'node:path';
import {
  access,
} from 'node:fs/promises';
import {
  exportClipMetadataSchema,
  EXPORT_METADATA_APP_NAME,
  type ExportClipMetadata,
} from '../../shared/exportMetadata.ts';
import { resolveFfmpegPath } from './resolveFfmpegPath.ts';

type ProbeResult = {
  stdout: string;
};

export type ReadClipMetadataResult = {
  hasDiscoveryTags: boolean;
  metadata: ExportClipMetadata | null;
  metadataError: string | null;
};

const probeWithCommand = (
  command: string,
  commandArguments: string[],
): Promise<ProbeResult> => new Promise((resolve, reject) => {
  const child = spawn(command, commandArguments, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  child.stdout.on('data', (chunk) => {
    stdoutChunks.push(Buffer.from(chunk as Uint8Array));
  });
  child.stderr.on('data', (chunk) => {
    stderrChunks.push(Buffer.from(chunk as Uint8Array));
  });
  child.once('error', reject);
  child.once('close', (exitCode) => {
    if (exitCode !== 0) {
      const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();

      reject(new Error(stderr || `ffprobe exited with code ${String(exitCode)}`));

      return;
    }

    resolve({
      stdout: Buffer.concat(stdoutChunks).toString('utf8'),
    });
  });
});

const resolveFfprobeCandidates = async (): Promise<string[]> => {
  const ffmpegPath = resolveFfmpegPath().path;
  const extension = path.extname(ffmpegPath);
  const ffprobeBaseName = `ffprobe${extension}`;
  const siblingPath = path.join(path.dirname(ffmpegPath), ffprobeBaseName);
  const candidates: string[] = [];

  try {
    await access(siblingPath);
    candidates.push(siblingPath);
  } catch {
    // Fall back to PATH lookup.
  }

  candidates.push('ffprobe');

  return candidates;
};

const parseProbeOutput = (stdout: string): ReadClipMetadataResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stdout);
  } catch {
    return {
      hasDiscoveryTags: false,
      metadata: null,
      metadataError: null,
    };
  }

  const root = typeof parsed === 'object' && parsed !== null
    ? parsed as { format?: { tags?: Record<string, unknown> } }
    : {};
  const tags = root.format?.tags ?? {};
  const discoveryApp = typeof tags.cutrail_app === 'string' ? tags.cutrail_app : null;
  const discoveryJson = typeof tags.cutrail_export_json === 'string' ? tags.cutrail_export_json : null;
  const hasDiscoveryTags = discoveryApp === EXPORT_METADATA_APP_NAME || discoveryJson !== null;

  if (!hasDiscoveryTags || discoveryJson === null) {
    return {
      hasDiscoveryTags,
      metadata: null,
      metadataError: null,
    };
  }

  let decodedMetadata: unknown;

  try {
    decodedMetadata = JSON.parse(discoveryJson);
  } catch {
    return {
      hasDiscoveryTags: true,
      metadata: null,
      metadataError: 'invalid-json',
    };
  }

  const parsedMetadata = exportClipMetadataSchema.safeParse(decodedMetadata);

  if (!parsedMetadata.success) {
    return {
      hasDiscoveryTags: true,
      metadata: null,
      metadataError: parsedMetadata.error.issues[0]?.message ?? 'invalid-metadata',
    };
  }

  return {
    hasDiscoveryTags: true,
    metadata: parsedMetadata.data,
    metadataError: null,
  };
};

export const readClipMetadata = async (filePath: string): Promise<ReadClipMetadataResult> => {
  const candidates = await resolveFfprobeCandidates();
  const commandArguments = [
    '-v',
    'error',
    '-show_entries',
    'format_tags',
    '-of',
    'json',
    filePath,
  ];

  for (const command of candidates) {
    try {
      const result = await probeWithCommand(command, commandArguments);

      return parseProbeOutput(result.stdout);
    } catch {
      // Try next candidate.
    }
  }

  return {
    hasDiscoveryTags: false,
    metadata: null,
    metadataError: 'probe-failed',
  };
};
