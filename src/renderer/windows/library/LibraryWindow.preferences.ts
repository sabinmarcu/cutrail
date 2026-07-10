import type {
  LibraryFilterMode,
  LibraryGroupBy,
  LibrarySortBy,
  LibrarySortDirection,
  LibraryViewMode,
} from './LibraryWindow.types';

type LibraryWindowPreferences = {
  filterMode: LibraryFilterMode;
  groupBy: LibraryGroupBy;
  searchQuery: string;
  sortBy: LibrarySortBy;
  sortDirection: LibrarySortDirection;
  viewMode: LibraryViewMode;
};

const PREFERENCES_KEY = 'cutrail:library-window-preferences';

const FILTER_VALUES = new Set<LibraryFilterMode>(['all', 'with-clips', 'without-clips']);
const GROUP_VALUES = new Set<LibraryGroupBy>([
  'none',
  'name',
  'date-created',
  'date-modified',
  'extension',
  'clip-count',
]);
const SORT_VALUES = new Set<LibrarySortBy>([
  'name',
  'date-created',
  'date-modified',
  'extension',
  'clip-count',
  'size',
]);
const DIRECTION_VALUES = new Set<LibrarySortDirection>(['asc', 'desc']);
const VIEW_VALUES = new Set<LibraryViewMode>(['grid', 'list']);

const defaults: LibraryWindowPreferences = {
  filterMode: 'all',
  groupBy: 'none',
  searchQuery: '',
  sortBy: 'date-created',
  sortDirection: 'desc',
  viewMode: 'grid',
};

const readPreferences = (): LibraryWindowPreferences => {
  try {
    const raw = globalThis.localStorage.getItem(PREFERENCES_KEY);

    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<LibraryWindowPreferences>;

    return {
      filterMode: FILTER_VALUES.has(parsed.filterMode as LibraryFilterMode)
        ? parsed.filterMode as LibraryFilterMode
        : defaults.filterMode,
      groupBy: GROUP_VALUES.has(parsed.groupBy as LibraryGroupBy)
        ? parsed.groupBy as LibraryGroupBy
        : defaults.groupBy,
      searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : defaults.searchQuery,
      sortBy: SORT_VALUES.has(parsed.sortBy as LibrarySortBy)
        ? parsed.sortBy as LibrarySortBy
        : defaults.sortBy,
      sortDirection: DIRECTION_VALUES.has(parsed.sortDirection as LibrarySortDirection)
        ? parsed.sortDirection as LibrarySortDirection
        : defaults.sortDirection,
      viewMode: VIEW_VALUES.has(parsed.viewMode as LibraryViewMode)
        ? parsed.viewMode as LibraryViewMode
        : defaults.viewMode,
    };
  } catch {
    return defaults;
  }
};

const writePreferences = (preferences: LibraryWindowPreferences): void => {
  try {
    globalThis.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage failures in restricted environments.
  }
};

export {
  readPreferences,
  writePreferences,
};
