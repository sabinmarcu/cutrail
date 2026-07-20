import {
  describe,
  expect,
  it,
} from 'vitest';

import { buildExportJobs } from './exportJob.ts';

describe('buildExportJobs', () => {
  it('creates sorted export jobs with deterministic output names', () => {
    const result = buildExportJobs({
      sourcePath: '/videos/source.mp4',
      outputDirectory: '/clips',
      ranges: [
        {
          id: 'later',
          start: 20,
          end: 22,
        },
        {
          id: 'early',
          start: 5,
          end: 9,
        },
      ],
      variantKey: 'trim=fast|selected=2,3|muted=1',
    });

    expect(result.errors).toEqual([]);
    expect(result.jobs.map((job: { id: string }) => job.id)).toEqual(['early', 'later']);
    expect(result.jobs[0].outputPath).toBe('/clips/source__fast__00-00-05-000_00-00-09-000__v-4ab1a777.mp4');
    expect(result.jobs[1].outputPath).toBe('/clips/source__fast__00-00-20-000_00-00-22-000__v-4ab1a777.mp4');
  });

  it('returns validation errors for invalid ranges', () => {
    const result = buildExportJobs({
      sourcePath: '/videos/source.mp4',
      outputDirectory: '/clips',
      ranges: [
        {
          id: 'too-short',
          start: 1,
          end: 1.01,
        },
      ],
      options: {
        minimumDurationSeconds: 0.1,
      },
    });

    expect(result.jobs).toEqual([]);
    expect(result.errors).toMatchObject([
      {
        id: 'too-short',
        code: 'RANGE_TOO_SHORT',
      },
    ]);
  });
});
