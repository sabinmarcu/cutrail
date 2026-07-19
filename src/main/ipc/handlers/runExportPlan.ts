import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { ipcMain } from 'electron';
import type { RunExportPlanPayload } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { primeDragThumbnail } from '../../thumbnail/dragThumbnailCache.ts';
import { toNumber } from '../parseRanges.ts';

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
      const { checkFfmpegAvailability } = await import('../../../infra/ffmpeg/checkFfmpegAvailability.ts');
      const { runFfmpegJob } = await import('../../../infra/ffmpeg/runFfmpegJob.ts');
      const nextPayload: RunExportPlanPayload = typeof payload === 'object' && payload !== null
        ? payload as RunExportPlanPayload
        : {};
      const jobs = Array.isArray(nextPayload.jobs) ? nextPayload.jobs : [];
      const ffmpegCheck = await checkFfmpegAvailability();
      /** @type {unknown[]} */
      const results = [];

      if (!ffmpegCheck.available) {
        return {
          ffmpeg: ffmpegCheck,
          results: jobs.map((job: unknown) => {
            const nextJob: { id?: string } = typeof job === 'object' && job !== null
              ? job as { id?: string }
              : {};

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
        const nextJob: {
          id?: string;
          args?: string[];
          range?: { duration?: number | string };
          outputPath?: string;
        } = typeof job === 'object' && job !== null
          ? job as {
            id?: string;
            args?: string[];
            range?: { duration?: number | string };
            outputPath?: string;
          }
          : {};

        if (typeof nextJob.outputPath === 'string' && nextJob.outputPath.length > 0) {
          await mkdir(path.dirname(nextJob.outputPath), { recursive: true });
        }

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

        if (
          result.status === 'COMPLETED'
          && typeof nextJob.outputPath === 'string'
          && nextJob.outputPath.length > 0
        ) {
          primeDragThumbnail(nextJob.outputPath, ffmpegCheck.path);
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
