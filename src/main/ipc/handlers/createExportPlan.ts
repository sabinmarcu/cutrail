import { ipcMain } from 'electron';
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

/** @returns {void} */
const registerCreateExportPlanHandler = () => {
  ipcMain.handle('cutrail:create-export-plan', async (event, payload) => {
    assertTrustedSender(event);
    const { buildExportJobs } = await import('../../../domain/exportJob.ts');
    const { buildFastTrimCommand } = await import('../../../infra/ffmpeg/buildFastTrimCommand.ts');
    const nextPayload: CreateExportPlanPayload = typeof payload === 'object' && payload !== null
      ? payload as CreateExportPlanPayload
      : {};
    const sourcePath = typeof nextPayload.sourcePath === 'string' ? nextPayload.sourcePath : '';
    const outputDirectory = typeof nextPayload.outputDirectory === 'string'
      ? nextPayload.outputDirectory
      : '';
    const ranges = parseRanges(nextPayload.ranges);
    const extension = typeof nextPayload.extension === 'string' ? nextPayload.extension : 'mp4';
    const trimMode = nextPayload.trimMode === 'fast' ? 'fast' : 'accurate';
    const selectedAudioTrackIndices = toUniqueNonNegativeIntegers(
      nextPayload.selectedAudioTrackIndices,
    );
    const mutedAudioTrackIndices = toUniqueNonNegativeIntegers(nextPayload.mutedAudioTrackIndices);
    const audioStreamIndices = toUniqueNonNegativeIntegers(
      nextPayload.audioStreamIndices,
    );
    const exportPlan = buildExportJobs({
      sourcePath,
      outputDirectory,
      ranges,
      extension,
      trimMode,
    });
    const jobs = exportPlan.jobs.map((job) => ({
      ...job,
      selectedAudioTrackIndices,
      mutedAudioTrackIndices,
      args: buildFastTrimCommand({
        inputPath: job.inputPath,
        outputPath: job.outputPath,
        range: job.range,
        trimMode,
        audioStreamIndices,
      }),
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
