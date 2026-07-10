import { Button } from '@renderer/components/Button';
import { VideoPreview } from '@renderer/components/VideoPreview';
import { formatDayMonthYear } from './LibraryWindow.date';
import type {
  LibraryVideoEntry,
  LibraryViewMode,
} from './LibraryWindow.types';
import {
  card,
  cardActions,
  cardContent,
  cardMeta,
  cardTitle,
  listCard,
  listCardContent,
  previewCell,
} from './LibraryWindow.css';

type LibraryWindowItemProps = {
  video: LibraryVideoEntry;
  viewMode: LibraryViewMode;
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const LibraryWindowItem = ({
  video,
  viewMode,
}: LibraryWindowItemProps) => {
  const listMode = viewMode === 'list';

  return (
    <article className={`${card} ${listMode ? listCard : ''}`}>
      <div className={previewCell}>
        <VideoPreview filePath={video.filePath} title={video.fileName} />
      </div>
      <div className={`${cardContent} ${listMode ? listCardContent : ''}`}>
        <h3 className={cardTitle}>{video.fileName}</h3>
        <p className={cardMeta}>Extension: {video.extension.replace(/^\./, '').toUpperCase()}</p>
        <p className={cardMeta}>Extracted clips: {video.clipCount}</p>
        <p className={cardMeta}>Created: {formatDayMonthYear(video.createdAtMs)}</p>
        <p className={cardMeta}>Modified: {formatDayMonthYear(video.modifiedAtMs)}</p>
        <p className={cardMeta}>Size: {formatSize(video.sizeBytes)}</p>
        <div className={cardActions}>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              globalThis.cutrail?.openVideoEditor?.({ sourcePath: video.filePath });
            }}
          >
            Open In Editor
          </Button>
        </div>
      </div>
    </article>
  );
};
