import { SegmentedSwitch } from '@renderer/components/SegmentedSwitch';
import { WindowDecoration } from '@renderer/components/WindowDecoration';
import type {
  LibraryFilterMode,
  LibraryGroupBy,
  LibrarySortBy,
  LibrarySortDirection,
  LibraryViewMode,
} from './LibraryWindow.types';
import {
  control,
  controlLabel,
  controlsBar,
  controlSelect,
  controlsGrid,
  dropdownRow,
  searchControl,
  searchInput,
  topRow,
  viewControl,
  viewSwitch,
  viewSwitchOption,
} from './LibraryWindow.css';

type LibraryWindowDecorationProps = {
  filterMode: LibraryFilterMode;
  groupBy: LibraryGroupBy;
  searchQuery: string;
  setFilterMode: (value: LibraryFilterMode) => void;
  setGroupBy: (value: LibraryGroupBy) => void;
  setSearchQuery: (value: string) => void;
  setSortBy: (value: LibrarySortBy) => void;
  setSortDirection: (value: LibrarySortDirection) => void;
  setViewMode: (value: LibraryViewMode) => void;
  sortBy: LibrarySortBy;
  sortDirection: LibrarySortDirection;
  viewMode: LibraryViewMode;
};

export const LibraryWindowDecoration = ({
  filterMode,
  groupBy,
  searchQuery,
  setFilterMode,
  setGroupBy,
  setSearchQuery,
  setSortBy,
  setSortDirection,
  setViewMode,
  sortBy,
  sortDirection,
  viewMode,
}: LibraryWindowDecorationProps) => (
  <header className={controlsBar}>
    <WindowDecoration titleText="Cutrail Library" subtitleText="Browse source videos, clips, and launch editor windows." />
    <div className={controlsGrid}>
      <div className={topRow}>
        <label className={`${control} ${searchControl}`}>
          <span className={controlLabel}>Search</span>
          <input
            type="search"
            value={searchQuery}
            className={searchInput}
            placeholder="Find by name or extension"
            onChange={(event) => {
              setSearchQuery(event.currentTarget.value);
            }}
          />
        </label>
        <div className={`${control} ${viewControl}`}>
          <span className={controlLabel}>View</span>
          <SegmentedSwitch
            ariaLabel="Library view mode"
            className={viewSwitch}
            optionClassName={viewSwitchOption}
            value={viewMode}
            onChange={(nextViewMode) => {
              setViewMode(nextViewMode as LibraryViewMode);
            }}
            options={[
              {
                label: 'Grid',
                value: 'grid',
              },
              {
                label: 'List',
                value: 'list',
              },
            ]}
          />
        </div>
      </div>
      <div className={dropdownRow}>
        <label className={control}>
          <span className={controlLabel}>Group By</span>
          <select
            className={controlSelect}
            value={groupBy}
            onChange={(event) => setGroupBy(event.currentTarget.value as LibraryGroupBy)}
          >
            <option value="none">None</option>
            <option value="name">Name</option>
            <option value="date-created">Date Created</option>
            <option value="date-modified">Date Modified</option>
            <option value="extension">Extension</option>
            <option value="clip-count">Clip Count</option>
          </select>
        </label>
        <label className={control}>
          <span className={controlLabel}>Sort By</span>
          <select
            className={controlSelect}
            value={sortBy}
            onChange={(event) => setSortBy(event.currentTarget.value as LibrarySortBy)}
          >
            <option value="name">Name</option>
            <option value="date-created">Date Created</option>
            <option value="date-modified">Date Modified</option>
            <option value="extension">Extension</option>
            <option value="clip-count">Clip Count</option>
            <option value="size">Size</option>
          </select>
        </label>
        <label className={control}>
          <span className={controlLabel}>Sort Dir</span>
          <SegmentedSwitch
            ariaLabel="Library sort direction"
            className={viewSwitch}
            optionClassName={viewSwitchOption}
            value={sortDirection}
            onChange={(nextValue) => {
              setSortDirection(nextValue as LibrarySortDirection);
            }}
            options={[
              {
                label: 'Ascending',
                value: 'asc',
              },
              {
                label: 'Descending',
                value: 'desc',
              },
            ]}
          />
        </label>
        <label className={control}>
          <span className={controlLabel}>Filter</span>
          <SegmentedSwitch
            ariaLabel="Library filter mode"
            className={viewSwitch}
            optionClassName={viewSwitchOption}
            value={filterMode}
            onChange={(nextValue) => setFilterMode(nextValue as LibraryFilterMode)}
            options={[
              {
                label: 'All Videos',
                value: 'all',
              },
              {
                label: 'With Clips',
                value: 'with-clips',
              },
              {
                label: 'Without Clips',
                value: 'without-clips',
              },
            ]}
          />
        </label>
      </div>
    </div>
  </header>
);
