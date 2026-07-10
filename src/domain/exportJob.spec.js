import {
  describe,
  expect,
  it,
} from 'vitest';

import { buildExportJobs } from './exportJob';

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
    });

    expect(result.errors).toEqual([]);
    expect(result.jobs.map((job) => job.id)).toEqual(['early', 'later']);
    expect(result.jobs[0].outputPath).toBe('/clips/source__fast__00-00-05_00-00-09.mp4');
    expect(result.jobs[1].outputPath).toBe('/clips/source__fast__00-00-20_00-00-22.mp4');
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
