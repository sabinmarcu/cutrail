import type {
  LibraryFilterMode,
  LibraryGroupBy,
  LibrarySortBy,
  LibrarySortDirection,
  LibraryVideoEntry,
} from './LibraryWindow.types';
import {
  formatDayMonthYear,
  formatRelativeDayFromNow,
} from './LibraryWindow.date';

const compareNumber = (left: number, right: number): number => left - right;

const compareString = (left: string, right: string): number => (
  left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
);

const getSortableValue = (video: LibraryVideoEntry, sortBy: LibrarySortBy): string | number => {
  if (sortBy === 'name') {
    return video.fileName;
  }

  if (sortBy === 'date-created') {
    return video.createdAtMs;
  }

  if (sortBy === 'date-modified') {
    return video.modifiedAtMs;
  }

  if (sortBy === 'extension') {
    return video.extension;
  }

  if (sortBy === 'clip-count') {
    return video.clipCount;
  }

  return video.sizeBytes;
};

const getGroupLabel = (video: LibraryVideoEntry, groupBy: LibraryGroupBy): string => {
  if (groupBy === 'name') {
    return (video.fileName[0] ?? '#').toUpperCase();
  }

  if (groupBy === 'date-created') {
    const dayMonthYear = formatDayMonthYear(video.createdAtMs);
    const relativeDay = formatRelativeDayFromNow(video.createdAtMs);

    return `${relativeDay} (${dayMonthYear})`;
  }

  if (groupBy === 'date-modified') {
    const dayMonthYear = formatDayMonthYear(video.modifiedAtMs);
    const relativeDay = formatRelativeDayFromNow(video.modifiedAtMs);

    return `${relativeDay} (${dayMonthYear})`;
  }

  if (groupBy === 'extension') {
    return video.extension.replace(/^\./, '').toUpperCase();
  }

  if (groupBy === 'clip-count') {
    return `${video.clipCount} clip${video.clipCount === 1 ? '' : 's'}`;
  }

  return 'All Videos';
};

const applySearchAndFilter = (
  videos: LibraryVideoEntry[],
  searchQuery: string,
  filterMode: LibraryFilterMode,
): LibraryVideoEntry[] => {
  const search = searchQuery.trim().toLowerCase();

  return videos.filter((video) => {
    if (filterMode === 'with-clips' && video.clipCount <= 0) {
      return false;
    }

    if (filterMode === 'without-clips' && video.clipCount > 0) {
      return false;
    }

    if (!search) {
      return true;
    }

    return video.fileName.toLowerCase().includes(search)
      || video.extension.toLowerCase().includes(search);
  });
};

const sortVideos = (
  videos: LibraryVideoEntry[],
  sortBy: LibrarySortBy,
  direction: LibrarySortDirection,
): LibraryVideoEntry[] => {
  const sorted = [...videos].sort((left, right) => {
    const leftValue = getSortableValue(left, sortBy);
    const rightValue = getSortableValue(right, sortBy);

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return compareNumber(leftValue, rightValue);
    }

    return compareString(String(leftValue), String(rightValue));
  });

  return direction === 'asc' ? sorted : sorted.reverse();
};

const groupVideos = (
  videos: LibraryVideoEntry[],
  groupBy: LibraryGroupBy,
): Array<{ key: string; label: string; videos: LibraryVideoEntry[] }> => {
  const groups = new Map<string, LibraryVideoEntry[]>();

  for (const video of videos) {
    const label = getGroupLabel(video, groupBy);
    const key = `${groupBy}:${label}`;
    const current = groups.get(key) ?? [];

    current.push(video);
    groups.set(key, current);
  }

  return [...groups.entries()].map(([key, groupedVideos]) => ({
    key,
    label: key.split(':').slice(1).join(':'),
    videos: groupedVideos,
  }));
};

export {
  applySearchAndFilter,
  groupVideos,
  sortVideos,
};
