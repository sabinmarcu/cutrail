// @ts-check

import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import { primeDragThumbnail } from '../../thumbnail/dragThumbnailCache.js';
import { toNumber } from '../parseRanges.mjs';

/** @returns {void} */
const registerRunExportPlanHandler = () => {
  ipcMain.handle(
    'cutrail:run-export-plan',
    /**
     * @param {import('electron').IpcMainInvokeEvent} event
     * @param {{ jobs?: unknown[] } | undefined} payload
     */
    async (event, payload) => {
      assertTrustedSender(event);
      const { checkFfmpegAvailability } = await import('../../../infra/ffmpeg/checkFfmpegAvailability.js');
      const { runFfmpegJob } = await import('../../../infra/ffmpeg/runFfmpegJob.js');
      const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
      const jobs = Array.isArray(nextPayload.jobs) ? nextPayload.jobs : [];
      const ffmpegCheck = await checkFfmpegAvailability();
      /** @type {unknown[]} */
      const results = [];

      if (!ffmpegCheck.available) {
        return {
          ffmpeg: ffmpegCheck,
          results: jobs.map((job) => {
            /** @type {{ id?: string }} */
            const nextJob = typeof job === 'object' && job !== null ? job : {};

            return {
              jobId: String(nextJob.id ?? ''),
              status: 'FAILED',
              code: 'FFMPEG_NOT_AVAILABLE',
              /** @type {number | null} */
              exitCode: null,
              /** @type {string | null} */
              signal: null,
              stderrSummary: ffmpegCheck.error ?? 'ffmpeg is not available',
              error: ffmpegCheck.error ?? 'ffmpeg is not available',
              durationMs: 0,
            };
          }),
        };
      }

      for (const job of jobs) {
        /** @type {{ id?: string, args?: string[], range?: { duration?: number | string }, outputPath?: string }} */
        const nextJob = typeof job === 'object' && job !== null ? job : {};
        const result = await runFfmpegJob({
          jobId: String(nextJob.id ?? ''),
          args: Array.isArray(nextJob.args) ? nextJob.args : [],
          ffmpegPath: ffmpegCheck.path,
          totalDuration: toNumber(nextJob.range?.duration),
          /** @param {unknown} progress */
          onProgress: (progress) => {
            event.sender.send('cutrail:export-progress', progress);
          },
        });

        results.push(result);

        if (result.status === 'COMPLETED' && typeof nextJob.outputPath === 'string' && nextJob.outputPath.length > 0) {
          void primeDragThumbnail(nextJob.outputPath, ffmpegCheck.path);
        }
      }

      return {
        ffmpeg: ffmpegCheck,
        results,
      };
    },
  );
};

export {
  registerRunExportPlanHandler,
};
