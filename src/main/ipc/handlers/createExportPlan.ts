import { stat } from 'node:fs/promises';
import path from 'node:path';
import { ipcMain } from 'electron';
import type { ZodError } from 'zod';
import type { CreateExportPlanPayload } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { parseRanges } from '../parseRanges.ts';

const toUniqueNonNegativeIntegers = (value: unknown): number[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const sanitized = value
    .filter((item): item is number => Number.isInteger(item) && item >= 0)
    .map(Number);

  return [...new Set(sanitized)].sort((left, right) => left - right);
};

const formatValidationError = (error: ZodError): string => {
  const issues = error.issues.map((issue) => {
    const issuePath = issue.path.length > 0 ? issue.path.join('.') : 'payload';

    return `${issuePath}: ${issue.message}`;
  });

  return issues.join('; ');
};

const appendOutputSuffix = (outputPath: string, suffix: string): string => {
  const parsedPath = path.parse(outputPath);

  return path.join(parsedPath.dir, `${parsedPath.name}__${suffix}${parsedPath.ext}`);
};

const fileExists = async (filePath: string): Promise<boolean> => {
  const fileStats = await stat(filePath).catch(() => null);

  return fileStats?.isFile() === true;
};

const resolveOutputPathAgainstExistingFiles = async (outputPath: string): Promise<string> => {
  if (!(await fileExists(outputPath))) {
    return outputPath;
  }

  let suffixIndex = 2;

  while (true) {
    const candidatePath = appendOutputSuffix(outputPath, `variant-${suffixIndex}`);

    if (!(await fileExists(candidatePath))) {
      return candidatePath;
    }

    suffixIndex += 1;
  }
};

/** @returns {void} */
const registerCreateExportPlanHandler = () => {
  ipcMain.handle('cutrail:create-export-plan', async (event, payload) => {
    assertTrustedSender(event);
    const { buildExportJobs } = await import('../../../domain/exportJob.ts');
    const {
      createClipId,
      createPlanId,
      createSourceFingerprint,
      createVariantKey,
    } = await import('../../../domain/exportMetadata.identity.ts');
    const {
      createRangeKey,
      normalizeRangeMilliseconds,
      normalizeTrackIndices,
    } = await import('../../../domain/exportMetadata.normalize.ts');
    const { buildFastTrimCommand } = await import('../../../infra/ffmpeg/buildFastTrimCommand.ts');
    const { resolveFastTrimRange } = await import('../../../infra/ffmpeg/resolveFastTrimRange.ts');
    const {
      createExportPlanPayloadSchema,
      exportClipMetadataSchema,
    } = await import('../../../shared/exportMetadata.ts');
    const nextPayload: CreateExportPlanPayload = typeof payload === 'object' && payload !== null
      ? payload as CreateExportPlanPayload
      : {};
    const parsedPayload = createExportPlanPayloadSchema.safeParse(nextPayload);

    if (!parsedPayload.success) {
      throw new TypeError(
        `Invalid create export plan payload: ${formatValidationError(parsedPayload.error)}`,
      );
    }

    const { sourcePath } = parsedPayload.data;
    const { outputDirectory } = parsedPayload.data;
    const ranges = parseRanges(parsedPayload.data.ranges);
    const extension = parsedPayload.data.extension ?? 'mp4';
    const trimMode = parsedPayload.data.trimMode ?? 'accurate';
    const selectedAudioTrackIndices = normalizeTrackIndices(
      parsedPayload.data.selectedAudioTrackIndices,
    );
    const mutedAudioTrackIndices = normalizeTrackIndices(
      parsedPayload.data.mutedAudioTrackIndices,
    );
    const audioStreamIndices = toUniqueNonNegativeIntegers(
      parsedPayload.data.audioStreamIndices,
    );
    const createdAtMs = Date.now();
    const sourceFingerprint = createSourceFingerprint(sourcePath);
    const planId = createPlanId({
      sourceFingerprint,
      createdAtMs,
    });
    const variantKey = createVariantKey({
      trimMode,
      selectedAudioTrackIndices,
      mutedAudioTrackIndices,
    });
    const exportPlan = buildExportJobs({
      sourcePath,
      outputDirectory,
      ranges,
      extension,
      trimMode,
      variantKey,
    });
    const jobs = await Promise.all(exportPlan.jobs.map(async (job) => {
      const resolvedOutputPath = await resolveOutputPathAgainstExistingFiles(job.outputPath);
      const resolvedTrimRange = trimMode === 'fast'
        ? await resolveFastTrimRange({
          inputPath: job.inputPath,
          range: job.range,
        })
        : job.range;
      const resolvedRange = {
        ...job.range,
        start: resolvedTrimRange.start,
        duration: resolvedTrimRange.duration,
        end: resolvedTrimRange.start + resolvedTrimRange.duration,
      };
      const metadata = exportClipMetadataSchema.parse((() => {
        const rangeMs = normalizeRangeMilliseconds(resolvedRange);
        const rangeKey = createRangeKey(rangeMs);

        return {
          schemaVersion: 1,
          appName: 'cutrail',
          clipId: createClipId({
            planId,
            sourceFingerprint,
            rangeKey,
            variantKey,
            outputPath: resolvedOutputPath,
          }),
          planId,
          sourceFingerprint,
          rangeMs,
          trimMode,
          selectedAudioTrackIndices,
          mutedAudioTrackIndices,
          variantKey,
          createdAtMs,
        };
      })());

      return {
        ...job,
        outputPath: resolvedOutputPath,
        range: resolvedRange,
        selectedAudioTrackIndices,
        mutedAudioTrackIndices,
        metadata,
        args: buildFastTrimCommand({
          inputPath: job.inputPath,
          outputPath: resolvedOutputPath,
          range: resolvedRange,
          trimMode,
          audioStreamIndices,
          metadata,
        }),
      };
    }));

    return {
      jobs,
      errors: exportPlan.errors,
    };
  });
};

export {
  registerCreateExportPlanHandler,
};
