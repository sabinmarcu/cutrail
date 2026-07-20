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
    const path = issue.path.length > 0 ? issue.path.join('.') : 'payload';

    return `${path}: ${issue.message}`;
  });

  return issues.join('; ');
};

/** @returns {void} */
const registerCreateExportPlanHandler = () => {
  ipcMain.handle('cutrail:create-export-plan', async (event, payload) => {
    assertTrustedSender(event);
    const { buildExportJobs } = await import('../../../domain/exportJob.ts');
    const {
      createClipId,
      createPlanId,
      createRangeKey,
      createSourceFingerprint,
      createVariantKey,
    } = await import('../../../domain/exportMetadata.identity.ts');
    const {
      normalizeRangeMilliseconds,
      normalizeTrackIndices,
    } = await import('../../../domain/exportMetadata.normalize.ts');
    const { buildFastTrimCommand } = await import('../../../infra/ffmpeg/buildFastTrimCommand.ts');
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
    });
    const jobs = exportPlan.jobs.map((job) => {
      const metadata = exportClipMetadataSchema.parse((() => {
        const rangeMs = normalizeRangeMilliseconds(job.range);
        const rangeKey = createRangeKey(rangeMs);

        return {
          schemaVersion: 1,
          appName: 'cutrail',
          clipId: createClipId({
            planId,
            sourceFingerprint,
            rangeKey,
            variantKey,
            outputPath: job.outputPath,
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
        selectedAudioTrackIndices,
        mutedAudioTrackIndices,
        metadata,
        args: buildFastTrimCommand({
          inputPath: job.inputPath,
          outputPath: job.outputPath,
          range: job.range,
          trimMode,
          audioStreamIndices,
          metadata,
        }),
      };
    });

    return {
      jobs,
      errors: exportPlan.errors,
    };
  });
};

export {
  registerCreateExportPlanHandler,
};
