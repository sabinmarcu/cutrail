export type LibraryVideoEntry = {
  fileName: string;
  filePath: string;
  extension: string;
  sizeBytes: number;
  createdAtMs: number;
  modifiedAtMs: number;
  clipCount: number;
};

export type LibraryViewMode = 'grid' | 'list';

export type LibraryFilterMode = 'all' | 'with-clips' | 'without-clips';

export type LibraryGroupBy =
  | 'none'
  | 'name'
  | 'date-created'
  | 'date-modified'
  | 'extension'
  | 'clip-count';

export type LibrarySortBy =
  | 'name'
  | 'date-created'
  | 'date-modified'
  | 'extension'
  | 'clip-count'
  | 'size';

export type LibrarySortDirection = 'asc' | 'desc';
