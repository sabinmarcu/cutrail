import { spawn } from 'node:child_process';
import {
  exportClipMetadataSchema,
  EXPORT_METADATA_APP_NAME,
  type ExportClipMetadata,
} from '../../shared/exportMetadata.ts';
import { resolveFfprobeCandidates } from './resolveFfprobeCandidates.ts';

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

const resolveTagValue = (
  tags: Record<string, unknown>,
  canonicalKey: string,
): string | null => {
  const normalizedTargetKey = canonicalKey.toLowerCase();

  for (const [key, value] of Object.entries(tags)) {
    if (typeof value === 'string') {
      const normalizedKey = key.toLowerCase();

      if (normalizedKey === normalizedTargetKey || normalizedKey.endsWith(`.${normalizedTargetKey}`)) {
        return value;
      }
    }
  }

  return null;
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
  const discoveryApp = resolveTagValue(tags, 'cutrail_app');
  const discoveryJson = resolveTagValue(tags, 'cutrail_export_json');
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
  const candidates = resolveFfprobeCandidates();
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
      const parsed = parseProbeOutput(result.stdout);

      return parsed;
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
