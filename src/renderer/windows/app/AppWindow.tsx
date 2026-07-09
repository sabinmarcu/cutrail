import {
  type DragEvent,
  useRef,
  useState,
} from 'react';
import logoPath from '@assets/logo-green.svg';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/Button';
import {
  dragActive,
  dropHint,
  logo,
  noDrag,
  page,
  shell,
  subtitle,
  title,
  content,
  footer,
} from './AppWindow.css';

type ElectronDropFile = File & { path?: string };

const parseFileUri = (candidate: string): string | null => {
  if (!candidate.startsWith('file://')) {
    return null;
  }

  try {
    const parsed = new URL(candidate);

    if (parsed.protocol !== 'file:') {
      return null;
    }

    const decodedPath = decodeURIComponent(parsed.pathname || '');

    return decodedPath.length > 0 ? decodedPath : null;
  } catch {
    return decodeURIComponent(candidate.replace(/^file:\/\//, ''));
  }
};

const hasFilePayload = (event: DragEvent<HTMLElement>): boolean => {
  const { dataTransfer } = event;

  if (!dataTransfer) {
    return false;
  }

  if (dataTransfer.files.length > 0) {
    return true;
  }

  if ([...dataTransfer.items].some((item) => item.kind === 'file')) {
    return true;
  }

  return [...dataTransfer.types].includes('Files');
};

const getDroppedFilePaths = (event: DragEvent<HTMLElement>): string[] => {
  const paths = new Set<string>();
  const { dataTransfer } = event;

  if (!dataTransfer) {
    return [];
  }

  for (const nextFile of dataTransfer.files) {
    const resolvedFromBridge = globalThis.cutrail?.getPathForFile?.(nextFile);

    if (typeof resolvedFromBridge === 'string' && resolvedFromBridge.length > 0) {
      paths.add(resolvedFromBridge);
    } else {
      const electronFile = nextFile as ElectronDropFile;

      if (typeof electronFile.path === 'string' && electronFile.path.length > 0) {
        paths.add(electronFile.path);
      }
    }
  }

  for (const nextItem of dataTransfer.items) {
    const itemFile = nextItem.getAsFile?.();

    if (itemFile) {
      const resolvedFromBridge = globalThis.cutrail?.getPathForFile?.(itemFile);

      if (typeof resolvedFromBridge === 'string' && resolvedFromBridge.length > 0) {
        paths.add(resolvedFromBridge);
      } else {
        const electronItemFile = itemFile as ElectronDropFile;

        if (typeof electronItemFile.path === 'string' && electronItemFile.path.length > 0) {
          paths.add(electronItemFile.path);
        }
      }
    }
  }

  const uriList = dataTransfer.getData('text/uri-list');

  for (const candidate of uriList.split('\n').map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith('#'))) {
    const parsedPath = parseFileUri(candidate);

    if (parsedPath) {
      paths.add(parsedPath);
    }
  }

  const plainText = dataTransfer.getData('text/plain');

  for (const candidate of plainText.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)) {
    const parsedPath = parseFileUri(candidate);

    if (parsedPath) {
      paths.add(parsedPath);
    } else if (candidate.startsWith('/')) {
      paths.add(candidate);
    }
  }

  return [...paths];
};

export const AppWindow = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthReference = useRef(0);

  return (
    <main
      className={page}
      onDragEnter={(event) => {
        if (!hasFilePayload(event)) {
          return;
        }

        event.preventDefault();
        dragDepthReference.current += 1;
        setIsDragActive(true);
      }}
      onDragOver={(event) => {
        if (!hasFilePayload(event)) {
          return;
        }

        event.preventDefault();
        const { dataTransfer } = event;

        if (dataTransfer) {
          dataTransfer.dropEffect = 'copy';
        }
      }}
      onDragLeave={(event) => {
        if (!isDragActive) {
          return;
        }

        event.preventDefault();
        dragDepthReference.current = Math.max(0, dragDepthReference.current - 1);

        if (dragDepthReference.current === 0) {
          setIsDragActive(false);
        }
      }}
      onDropCapture={(event) => {
        event.preventDefault();
        dragDepthReference.current = 0;
        setIsDragActive(false);
        const sourcePaths = getDroppedFilePaths(event);

        void (async () => {
          for (const sourcePath of sourcePaths) {
            await globalThis.cutrail?.openVideoEditor?.({ sourcePath });
          }
        })();
      }}
    >
      <section className={shell}>
          <section className={`${content} ${noDrag} ${isDragActive ? dragActive : ''}`}>
          <img className={logo} src={logoPath} alt="Cutrail" />
          <h1 className={title}>Cutrail</h1>
          <p className={subtitle}>Open a source video to begin editing clips.</p>
          <p className={dropHint}>Or drop a video file here</p>
          <Button
            type="button"
            variant="primary"
            className={noDrag}
            onClick={() => {
              void globalThis.cutrail?.openVideoEditor?.();
            }}
          >
            Select Video File
          </Button>
        </section>
        <footer className={footer}>
          <Button
            type="button"
            variant="secondary"
            className={noDrag}
            onClick={() => void globalThis.cutrail?.closeWindow?.()}
          >
            Close
          </Button>
        </footer>
      </section>
    </main>
  );
};
