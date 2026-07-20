import { createHash } from 'node:crypto';
import path from 'node:path';
import type {
  ExportTrimMode,
} from '../shared/exportMetadata.ts';
import {
  normalizeTrackIndices,
} from './exportMetadata.normalize.ts';

type VariantIdentityInput = {
  trimMode: ExportTrimMode;
  selectedAudioTrackIndices?: readonly number[];
  mutedAudioTrackIndices?: readonly number[];
};

type PlanIdentityInput = {
  sourceFingerprint: string;
  createdAtMs: number;
};

type ClipIdentityInput = {
  planId: string;
  sourceFingerprint: string;
  rangeKey: string;
  variantKey: string;
  outputPath: string;
};

const hashText = (value: string): string => createHash('sha256').update(value).digest('hex');

export const createSourceFingerprint = (sourcePath: string): string => {
  if (typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
    throw new TypeError('sourcePath must be a non-empty string');
  }

  return hashText(path.resolve(sourcePath));
};

export const createVariantKey = ({
  trimMode,
  selectedAudioTrackIndices,
  mutedAudioTrackIndices,
}: VariantIdentityInput): string => {
  const selected = normalizeTrackIndices(selectedAudioTrackIndices);
  const muted = normalizeTrackIndices(mutedAudioTrackIndices);

  return `trim=${trimMode}|selected=${selected.join(',')}|muted=${muted.join(',')}`;
};

export const createPlanId = ({ sourceFingerprint, createdAtMs }: PlanIdentityInput): string => {
  if (!Number.isInteger(createdAtMs) || createdAtMs < 0) {
    throw new TypeError('createdAtMs must be a non-negative integer');
  }

  const digest = hashText(`${sourceFingerprint}|${createdAtMs}`).slice(0, 12);

  return `plan_${createdAtMs}_${digest}`;
};

export const createClipId = ({
  planId,
  sourceFingerprint,
  rangeKey,
  variantKey,
  outputPath,
}: ClipIdentityInput): string => {
  const digest = hashText(
    `${planId}|${sourceFingerprint}|${rangeKey}|${variantKey}|${path.resolve(outputPath)}`,
  ).slice(0, 16);

  return `clip_${digest}`;
};
