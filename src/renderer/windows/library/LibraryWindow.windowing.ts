import type {
  LibraryVideoEntry,
  LibraryViewMode,
} from './LibraryWindow.types';

type LibraryVideoGroup = {
  key: string;
  label: string;
  videos: LibraryVideoEntry[];
};

type ViewportSize = {
  height: number;
  width: number;
};

const DEFAULT_VIEWPORT_SIZE: ViewportSize = {
  height: 720,
  width: 1280,
};
const GRID_CARD_WIDTH = 240;
const GRID_ROW_HEIGHT = 220;
const LIST_ROW_HEIGHT = 180;

const getVisibleBatchSize = (
  viewMode: LibraryViewMode,
  viewport: ViewportSize,
): number => {
  const effectiveViewport = viewport.height > 0 && viewport.width > 0
    ? viewport
    : DEFAULT_VIEWPORT_SIZE;

  const columns = viewMode === 'grid'
    ? Math.max(1, Math.floor(effectiveViewport.width / GRID_CARD_WIDTH))
    : 1;
  const rowHeight = viewMode === 'grid' ? GRID_ROW_HEIGHT : LIST_ROW_HEIGHT;
  const rows = Math.max(1, Math.ceil(effectiveViewport.height / rowHeight));

  return columns * rows;
};

const getInitialVisibleVideoCount = (
  totalVideos: number,
  viewMode: LibraryViewMode,
  viewport: ViewportSize,
): number => Math.min(totalVideos, getVisibleBatchSize(viewMode, viewport));

const sliceGroupedVideos = (
  groups: LibraryVideoGroup[],
  visibleVideoCount: number,
): {
  hasMore: boolean;
  groups: LibraryVideoGroup[];
  visibleVideoCount: number;
} => {
  const totalVideoCount = groups.reduce((count, group) => count + group.videos.length, 0);
  const visibleGroups: LibraryVideoGroup[] = [];
  let remaining = visibleVideoCount;
  let renderedVideos = 0;

  for (const group of groups) {
    if (remaining <= 0) {
      break;
    }

    const videos = group.videos.slice(0, remaining);

    if (videos.length === 0) {
      remaining -= 0;
    } else {
      visibleGroups.push({
        ...group,
        videos,
      });
      remaining -= videos.length;
      renderedVideos += videos.length;
    }
  }

  return {
    hasMore: renderedVideos < totalVideoCount,
    groups: visibleGroups,
    visibleVideoCount: renderedVideos,
  };
};

export type {
  LibraryVideoGroup,
  ViewportSize,
};

export {
  getInitialVisibleVideoCount,
  getVisibleBatchSize,
  sliceGroupedVideos,
};

