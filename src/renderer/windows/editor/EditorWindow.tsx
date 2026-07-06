import { useMemo } from 'react';
import '@renderer/windows/globalReset.css';
import { ClippingProvider } from '@renderer/core/clipping';
import { WindowDecoration } from '@renderer/components/windowDecoration';
import {
  editorColumn,
  page,
  shell,
  workspaceGrid,
} from './EditorWindow.css';
import { EditorWindowKeyboardShortcuts } from './EditorWindow.KeyboardShortcuts';
import { EditorWindowSidebar } from './EditorWindow.Sidebar';
import { TimelineEditor } from './components/TimelineEditor/TimelineEditor';

const getInitialSourcePath = () => {
  const search = new URLSearchParams(globalThis.location.search);

  return search.get('source') ?? '';
};

const getSourceFilename = (sourcePath) => {
  if (!sourcePath) {
    return 'Timeline clipping workspace';
  }

  const normalized = sourcePath.replaceAll('\\', '/');
  const segments = normalized.split('/').filter(Boolean);

  return segments.at(-1) ?? 'Timeline clipping workspace';
};

export const EditorWindow = () => {
  const initialSourcePath = useMemo(() => getInitialSourcePath(), []);
  const subtitleText = useMemo(() => getSourceFilename(initialSourcePath), [initialSourcePath]);

  return (
    <main className={page}>
      <section className={shell}>
        <WindowDecoration
          subtitleText={subtitleText}
          titleText="Cutrail Editor"
        />
        <ClippingProvider initialSourcePath={initialSourcePath}>
          <EditorWindowKeyboardShortcuts />
          <div className={workspaceGrid}>
            <section className={editorColumn}>
              <TimelineEditor hideHeading showRangeList={false} />
            </section>
            <EditorWindowSidebar />
          </div>
        </ClippingProvider>
      </section>
    </main>
  );
};
