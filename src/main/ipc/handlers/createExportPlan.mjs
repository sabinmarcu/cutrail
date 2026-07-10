// @ts-check

import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import { parseRanges } from '../parseRanges.mjs';

/** @returns {void} */
const registerCreateExportPlanHandler = () => {
  ipcMain.handle('cutrail:create-export-plan', async (event, payload) => {
    assertTrustedSender(event);
    const { buildExportJobs } = await import('../../../domain/exportJob.js');
    const { buildFastTrimCommand } = await import('../../../infra/ffmpeg/buildFastTrimCommand.js');
    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
    const sourcePath = typeof nextPayload.sourcePath === 'string' ? nextPayload.sourcePath : '';
    const outputDirectory = typeof nextPayload.outputDirectory === 'string' ? nextPayload.outputDirectory : '';
    const ranges = parseRanges(nextPayload.ranges);
    const extension = typeof nextPayload.extension === 'string' ? nextPayload.extension : 'mp4';
    const trimMode = nextPayload.trimMode === 'fast' ? 'fast' : 'accurate';
    const exportPlan = buildExportJobs({
      sourcePath,
      outputDirectory,
      ranges,
      extension,
      trimMode,
    });
    const jobs = exportPlan.jobs.map((job) => ({
      ...job,
      args: buildFastTrimCommand({
        inputPath: job.inputPath,
        outputPath: job.outputPath,
        range: job.range,
        trimMode,
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
