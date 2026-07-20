import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  getInitialVisibleVideoCount,
  getVisibleBatchSize,
  sliceGroupedVideos,
} from './LibraryWindow.windowing';

describe('LibraryWindow.windowing', () => {
  it('caps the initial list batch to the measured viewport', () => {
    expect(getVisibleBatchSize('list', {
      height: 720,
      width: 1280,
    })).toBe(4);

    expect(getInitialVisibleVideoCount(100, 'list', {
      height: 720,
      width: 1280,
    })).toBe(4);
  });

  it('uses the grid viewport to determine the batch size', () => {
    expect(getVisibleBatchSize('grid', {
      height: 720,
      width: 1280,
    })).toBe(20);
  });

  it('slices grouped videos without overflowing the requested count', () => {
    const grouped = [
      {
        key: 'group:a',
        label: 'A',
        videos: [
          {
            filePath: 'a-1',
            fileName: 'a-1',
            extension: '.mp4',
            sizeBytes: 1,
            createdAtMs: 1,
            modifiedAtMs: 1,
            clipCount: 0,
          },
        ],
      },
      {
        key: 'group:b',
        label: 'B',
        videos: [
          {
            filePath: 'b-1',
            fileName: 'b-1',
            extension: '.mp4',
            sizeBytes: 1,
            createdAtMs: 1,
            modifiedAtMs: 1,
            clipCount: 0,
          },
          {
            filePath: 'b-2',
            fileName: 'b-2',
            extension: '.mp4',
            sizeBytes: 1,
            createdAtMs: 1,
            modifiedAtMs: 1,
            clipCount: 0,
          },
        ],
      },
    ];

    expect(sliceGroupedVideos(grouped, 2)).toEqual({
      hasMore: true,
      visibleVideoCount: 2,
      groups: [
        {
          key: 'group:a',
          label: 'A',
          videos: [grouped[0].videos[0]],
        },
        {
          key: 'group:b',
          label: 'B',
          videos: [grouped[1].videos[0]],
        },
      ],
    });
  });
});
