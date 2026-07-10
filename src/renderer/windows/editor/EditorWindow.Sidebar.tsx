import { useMemo } from 'react';
import { Button } from '@renderer/components/Button';
import { SegmentedSwitch } from '@renderer/components/SegmentedSwitch';
import {
  useClippingActions,
  useClippingState,
} from '@renderer/core/clipping';
import type {
  ClipEntry,
  ClipRange,
  ExistingClip,
  ProgressById,
  TrimMode,
} from '@renderer/core/clipping/clipping.types';
import { TimelineEditorGeneratedClipPreview } from './components/TimelineEditor/TimelineEditor.GeneratedClipPreview';
import { formatSeconds } from './components/TimelineEditor/TimelineEditor.utils';
import {
  clipActionButton,
  clipActionRow,
  clipItem,
  clipList,
  clipMeta,
  clipPanel,
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
  id: string;
  outputPath?: string;
};

type ClipRow = {
  key: string;
  filePath: string | undefined;
  hasPlannedOutput: boolean;
  progressText: string;
  range: ClipRange;
  sortStart: number;
  status: string;
  title: string;
};

function buildClipTitle(range: ClipRange, existingClip: ExistingClip | null): string {
  if (existingClip) {
    return `${existingClip.trimMode} ${formatSeconds(existingClip.range.start)} - ${formatSeconds(existingClip.range.end)}`;
  }

  return `${range.id}: ${formatSeconds(range.start)} - ${formatSeconds(range.end)}`;
}

function compareClipRows(left: ClipRow, right: ClipRow): number {
  return left.sortStart - right.sortStart || left.title.localeCompare(right.title);
}

function buildExistingStatus(existingClips: ExistingClip[]): string {
  const hasFast = existingClips.some((clip) => clip.trimMode === 'fast');
  const hasAccurate = existingClips.some((clip) => clip.trimMode === 'accurate');

  if (hasFast && hasAccurate) {
    return 'EXISTING (FAST + ACCURATE)';
  }

  if (hasFast) {
    return 'EXISTING (FAST)';
  }

  if (hasAccurate) {
    return 'EXISTING (ACCURATE)';
  }

  return 'EXISTING';
}

function buildClipRows({
  clipEntries,
  clipStatusMap,
  planJobs,
  progressById,
}: {
  clipEntries: ClipEntry[];
  clipStatusMap: Record<string, string>;
  planJobs: Map<string, PlannedClipJob>;
  progressById: ProgressById;
}): ClipRow[] {
  return clipEntries.map((clipEntry) => {
    const {
      currentModeClip,
      existingClips,
      range,
    } = clipEntry;
    const clipJob = planJobs.get(range.id);
    const baseStatus = clipStatusMap[range.id] ?? 'DRAFT';
    const status = existingClips.length > 0
      ? buildExistingStatus(existingClips)
      : (baseStatus === 'COMPLETED' ? 'COMPLETED' : baseStatus);
    const progress = progressById[range.id]?.ratio;

    return {
      key: `range:${range.id}`,
      filePath: currentModeClip?.filePath,
      hasPlannedOutput: typeof clipJob?.outputPath === 'string' && clipJob.outputPath.length > 0,
      progressText: progress === undefined || progress === null ? 'pending' : `${Math.round(progress * 100)}%`,
      range,
      sortStart: range.start,
      status,
      title: buildClipTitle(range, currentModeClip),
    };
  }).sort(compareClipRows);
}

export const EditorWindowSidebar = () => {
  const state = useClippingState();
  const {
    clipEntries,
    clipStatusMap,
    errorMessage,
    plan,
    progressById,
    readyToStart,
    trimMode,
  } = state;
  const {
    removeClip,
    setTrimMode,
    startExport,
  } = useClippingActions(state);
  const clipJobById = useMemo(() => plan.jobs.reduce(
    (nextMap, job) => nextMap.set(String(job.id), {
      id: String(job.id),
      outputPath: job.outputPath,
    }),
    new Map<string, PlannedClipJob>(),
  ), [plan.jobs]);

  const clipRows = useMemo(() => buildClipRows({
    clipEntries,
    clipStatusMap,
    planJobs: clipJobById,
    progressById,
  }), [clipEntries, clipJobById, clipStatusMap, progressById]);

  return (
    <aside className={sideColumn}>
      <section className={`${panel} ${clipPanel}`}>
        <h2 className={panelHeading}>Clips List</h2>
        <ul className={clipList}>
          {clipRows.length === 0 && (
            <li className={clipMeta}>No clips planned or found on disk.</li>
          )}
          {clipRows.map((clipRow) => (
            <li key={clipRow.key} className={clipItem}>
              <div className={clipTitle}>{clipRow.title}</div>
              <div className={clipMeta}>Status: {clipRow.status}</div>
              <div className={clipMeta}>
                Progress:
                {' '}
                {clipRow.filePath
                  ? clipRow.progressText
                  : (clipRow.hasPlannedOutput
                    ? 'syncing preview'
                    : clipRow.progressText)}
              </div>
              {clipRow.filePath && (
                <TimelineEditorGeneratedClipPreview
                  filePath={clipRow.filePath}
                  title={clipRow.title}
                />
              )}
              <div className={clipActionRow}>
                <Button
                  type="button"
                  variant="danger"
                  className={clipActionButton}
                  onClick={() => {
                    removeClip(clipRow.range);
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${panel} ${controlsPanel}`}>
        <div className={panelHeaderRow}>
          <h2 className={panelHeading}>Controls</h2>
          <SegmentedSwitch
            ariaLabel="Trim mode"
            value={trimMode}
            onChange={(nextMode) => {
              setTrimMode(nextMode as TrimMode);
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
          <Button
            type="button"
            variant="primary"
            onClick={() => { startExport(); }}
            disabled={!readyToStart}
          >
            Start Export
          </Button>
          {errorMessage.length > 0 && <p className={errorText}>{errorMessage}</p>}
        </div>
      </section>
    </aside>
  );
};
