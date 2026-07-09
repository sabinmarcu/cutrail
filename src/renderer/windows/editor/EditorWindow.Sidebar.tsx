import { useMemo } from 'react';
import { Button } from '@renderer/components/Button';
import { SegmentedSwitch } from '@renderer/components/SegmentedSwitch';
import { useClippingContext } from '@renderer/core/clipping';
import { TimelineEditorGeneratedClipPreview } from './components/TimelineEditor/TimelineEditor.GeneratedClipPreview';
import {
  clipPanel,
  clipItem,
  clipList,
  clipMeta,
  clipTitle,
  controlsPanel,
  errorText,
  panel,
  panelHeaderRow,
  panelHeading,
  sideActions,
  sideColumn,
} from './EditorWindow.css';

type PlannedClipJob = {
  id?: string;
  outputPath?: string;
};

export const EditorWindowSidebar = () => {
  const {
    clipStatusMap, errorMessage, plan, progressById, ranges, readyToStart, setTrimMode, startExport, trimMode,
  } = useClippingContext();
  const clipJobById = useMemo(() => new Map<string, PlannedClipJob>(plan.jobs.map((job) => {
    const nextJob = job as PlannedClipJob;

    return [String(nextJob.id ?? ''), nextJob];
  })), [plan.jobs]);

  return (
    <aside className={sideColumn}>
      <section className={`${panel} ${clipPanel}`}>
        <h2 className={panelHeading}>Clips List</h2>
        <ul className={clipList}>
          {ranges.length === 0 && <li className={clipMeta}>No clips planned.</li>}
          {ranges.map((range) => {
            const progress = progressById[range.id]?.ratio;
            const status = clipStatusMap[range.id] ?? 'DRAFT';
            const clipJob = clipJobById.get(range.id);

            return (
              <li key={range.id} className={clipItem}>
                <div className={clipTitle}>{range.id}</div>
                <div className={clipMeta}>Status: {status}</div>
                <div className={clipMeta}>
                  Progress: {progress === undefined || progress === null ? 'pending' : `${Math.round(progress * 100)}%`}
                </div>
                {status === 'COMPLETED' && clipJob && (
                  <TimelineEditorGeneratedClipPreview
                    filePath={clipJob.outputPath}
                    title={range.id}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${panel} ${controlsPanel}`}>
        <div className={panelHeaderRow}>
          <h2 className={panelHeading}>Controls</h2>
          <SegmentedSwitch
            ariaLabel="Trim mode"
            value={trimMode}
            onChange={(nextMode) => {
              setTrimMode(nextMode);
            }}
            options={[
              {
                label: 'Quick',
                value: 'fast',
              },
              {
                label: 'Accurate',
                value: 'accurate',
              },
            ]}
          />
        </div>
        <div className={sideActions}>
          <Button type="button" variant="primary" onClick={() => { void startExport(); }} disabled={!readyToStart}>
            Start Export
          </Button>
          {errorMessage.length > 0 && <p className={errorText}>{errorMessage}</p>}
        </div>
      </section>
    </aside>
  );
};
