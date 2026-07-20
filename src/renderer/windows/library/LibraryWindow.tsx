import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWatcherSubscriptions } from '@renderer/core/watchers';
import '@renderer/windows/globalReset.css';
import {
  applySearchAndFilter,
  groupVideos,
  sortVideos,
} from './LibraryWindow.filters';
import {
  readPreferences,
  writePreferences,
} from './LibraryWindow.preferences';
import {
  persistSeenVideoPaths,
  resolveNewVideoPaths,
} from './LibraryWindow.seen';
import { LibraryWindowDecoration } from './LibraryWindow.Decoration';
import { LibraryWindowItem } from './LibraryWindow.Item';
import {
  getInitialVisibleVideoCount,
  getVisibleBatchSize,
  sliceGroupedVideos,
} from './LibraryWindow.windowing';
import type {
  LibraryFilterMode,
  LibraryGroupBy,
  LibrarySortBy,
  LibrarySortDirection,
  LibraryVideoEntry,
  LibraryViewMode,
} from './LibraryWindow.types';
import {
  body,
  empty,
  group,
  groupTitle,
  loadMoreSentinel,
  shell,
  videosGrid,
  videosList,
} from './LibraryWindow.css';

export const LibraryWindow = () => {
  const [preferences] = useState(() => readPreferences());
  const [newVideoPaths, setNewVideoPaths] = useState(new Set<string>());
  const [videos, setVideos] = useState<LibraryVideoEntry[]>([]);
  const [visibleVideoCount, setVisibleVideoCount] = useState(24);
  const [searchQuery, setSearchQuery] = useState(preferences.searchQuery);
  const [viewMode, setViewMode] = useState<LibraryViewMode>(preferences.viewMode);
  const [filterMode, setFilterMode] = useState<LibraryFilterMode>(
    preferences.filterMode,
  );
  const [groupBy, setGroupBy] = useState<LibraryGroupBy>(preferences.groupBy);
  const [sortBy, setSortBy] = useState<LibrarySortBy>(preferences.sortBy);
  const [sortDirection, setSortDirection] = useState<LibrarySortDirection>(
    preferences.sortDirection,
  );
  const bodyReference = useRef<HTMLElement | null>(null);
  const sentinelReference = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({
    height: 0,
    width: 0,
  });

  const refreshLibrary = useCallback(async () => {
    if (typeof globalThis.cutrail?.getVideoLibrary !== 'function') {
      return;
    }

    const snapshot = await globalThis.cutrail.getVideoLibrary();
    const nextVideos = Array.isArray(snapshot.videos) ? snapshot.videos : [];

    setNewVideoPaths(resolveNewVideoPaths(nextVideos));
    setVideos(nextVideos);
  }, []);

  useWatcherSubscriptions({
    onSourceSnapshot: () => {
      refreshLibrary();
    },
    onOutputSnapshot: () => {
      refreshLibrary();
    },
  });

  useEffect(() => {
    refreshLibrary();

    const unsubscribeSource = typeof globalThis.cutrail?.onSourceDirectoryUpdated === 'function'
      ? globalThis.cutrail.onSourceDirectoryUpdated(() => {
        refreshLibrary();
      })
      : () => {};
    const unsubscribeOutput = typeof globalThis.cutrail?.onOutputDirectoryUpdated === 'function'
      ? globalThis.cutrail.onOutputDirectoryUpdated(() => {
        refreshLibrary();
      })
      : () => {};

    return () => {
      unsubscribeSource();
      unsubscribeOutput();
    };
  }, [refreshLibrary]);

  useEffect(() => {
    if (videos.length === 0) {
      return undefined;
    }

    // Delay persistence to avoid dev Strict Mode's mount/unmount cycle
    // instantly suppressing NEW badges on first visible render.
    const timer = globalThis.setTimeout(() => {
      persistSeenVideoPaths(videos);
    }, 250);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [videos]);

  useEffect(() => {
    writePreferences({
      filterMode,
      groupBy,
      searchQuery,
      sortBy,
      sortDirection,
      viewMode,
    });
  }, [
    filterMode,
    groupBy,
    searchQuery,
    sortBy,
    sortDirection,
    viewMode,
  ]);

  const groupedVideos = useMemo(() => {
    const filtered = applySearchAndFilter(videos, searchQuery, filterMode);
    const sorted = sortVideos(filtered, sortBy, sortDirection);

    return groupVideos(sorted, groupBy);
  }, [filterMode, groupBy, searchQuery, sortBy, sortDirection, videos]);

  const totalVideoCount = useMemo(
    () => groupedVideos.reduce((count, groupEntry) => count + groupEntry.videos.length, 0),
    [groupedVideos],
  );

  const initialVisibleVideoCount = useMemo(
    () => getInitialVisibleVideoCount(totalVideoCount, viewMode, viewportSize),
    [totalVideoCount, viewMode, viewportSize],
  );

  const visibleVideoBatchSize = useMemo(
    () => getVisibleBatchSize(viewMode, viewportSize),
    [viewMode, viewportSize],
  );

  const visibleGroups = useMemo(
    () => sliceGroupedVideos(groupedVideos, visibleVideoCount),
    [groupedVideos, visibleVideoCount],
  );

  useEffect(() => {
    setVisibleVideoCount(initialVisibleVideoCount);
  }, [
    filterMode,
    groupBy,
    initialVisibleVideoCount,
    searchQuery,
    sortBy,
    sortDirection,
    totalVideoCount,
    viewMode,
  ]);

  useEffect(() => {
    const element = bodyReference.current;

    if (!element) {
      return undefined;
    }

    const updateViewportSize = () => {
      setViewportSize({
        height: element.clientHeight,
        width: element.clientWidth,
      });
    };

    updateViewportSize();

    if (typeof globalThis.ResizeObserver !== 'function') {
      const onResize = () => {
        updateViewportSize();
      };

      globalThis.addEventListener('resize', onResize);

      return () => {
        globalThis.removeEventListener('resize', onResize);
      };
    }

    const observer = new ResizeObserver(() => {
      updateViewportSize();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visibleGroups.hasMore) {
      return undefined;
    }

    const sentinel = sentinelReference.current;
    const root = bodyReference.current;

    if (!sentinel || !root) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      setVisibleVideoCount((currentCount) => Math.min(
        totalVideoCount,
        currentCount + visibleVideoBatchSize,
      ));
    }, {
      root,
      threshold: 0.1,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [totalVideoCount, visibleGroups.hasMore, visibleVideoBatchSize]);

  return (
    <div className={shell}>
      <LibraryWindowDecoration
        filterMode={filterMode}
        groupBy={groupBy}
        searchQuery={searchQuery}
        setFilterMode={setFilterMode}
        setGroupBy={setGroupBy}
        setSearchQuery={setSearchQuery}
        setSortBy={setSortBy}
        setSortDirection={setSortDirection}
        setViewMode={setViewMode}
        sortBy={sortBy}
        sortDirection={sortDirection}
        viewMode={viewMode}
      />
      <main ref={bodyReference} className={body}>
        {groupedVideos.length === 0 ? <p className={empty}>No videos matched your query.</p> : null}
        {visibleGroups.groups.map((groupEntry) => (
          <section key={groupEntry.key} className={group}>
            <h2 className={groupTitle}>{groupEntry.label}</h2>
            <div className={viewMode === 'grid' ? videosGrid : videosList}>
              {groupEntry.videos.map((video) => (
                <LibraryWindowItem
                  key={video.filePath}
                  isNew={newVideoPaths.has(video.filePath)}
                  video={video}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </section>
        ))}
        {visibleGroups.hasMore ? <div ref={sentinelReference} className={loadMoreSentinel} aria-hidden="true" /> : null}
      </main>
    </div>
  );
};
