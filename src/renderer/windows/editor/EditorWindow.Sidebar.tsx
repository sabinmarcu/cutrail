import {
  type KeyboardEvent,
  useMemo,
} from 'react';
import { Button } from '@renderer/components/Button';
import { SegmentedSwitch } from '@renderer/components/SegmentedSwitch';
import {
  useClippingActions,
  useClippingState,
} from '@renderer/core/clipping';
import type {
  ClipEntry,
  ClipRange,
  ClipVariantEntry,
  SourceAudioTrack,
  TrimMode,
} from '@renderer/core/clipping/clipping.types';
import { TimelineEditorGeneratedClipPreview } from './components/TimelineEditor/TimelineEditor.GeneratedClipPreview';
import { formatSeconds } from './components/TimelineEditor/TimelineEditor.utils';
import {
  clipActionButton,
  clipCardMetaRow,
  clipHeaderLabel,
  clipHeaderRow,
  clipList,
  clipMeta,
  clipPanel,
  clipProgressBadge,
  clipProgressDraft,
  clipProgressExporting,
  clipProgressExportingFill,
  clipProgressExportingLabel,
  clipProgressOnDisk,
  clipSegmentedSwitch,
  clipSegmentedSwitchOption,
  clipTrackChipButton,
  clipTrackChip,
  clipTrackChipActive,
  clipTrackChipDisabled,
  clipTrackChipMuted,
  clipTrackGroup,
  clipTrackGroupLabel,
  clipTrackChipRow,
  clipTitle,
  clipVariantCardDraft,
  clipVariantCardExisting,
  clipVariantActions,
  clipVariantCard,
  clipVariantCardSelected,
  controlsPanel,
  errorText,
  panel,
  panelHeading,
  sideActions,
  sideColumn,
} from './EditorWindow.css';

type ClipRow = {
  range: ClipRange;
  sortStart: number;
  variantRows: VariantRow[];
};

type VariantRow = {
  exportProgressPercent: number;
  filePath: string | null;
  hasTrustedClip: boolean;
  isDraftBacked: boolean;
  key: string;
  modifiedAtMs: number | null;
  range: ClipRange;
  trackStates: TrackState[];
  variant: ClipVariantEntry;
  progressLabel: string;
  statusLabel: string;
  title: string;
};

type TrackState = {
  index: number;
  isMuted: boolean;
  label: string;
};

const normalizeVisibleTrackIndices = ({
  hideDefaultAudioTrackWhenMultiple,
  trackIndices,
}: {
  hideDefaultAudioTrackWhenMultiple: boolean;
  trackIndices: number[];
}): number[] => {
  const normalizedIndices = trackIndices
    .filter((index) => Number.isInteger(index) && index >= 0)
    .filter((index) => !hideDefaultAudioTrackWhenMultiple || index !== 0);

  return [...new Set(normalizedIndices)].sort((left, right) => left - right);
};

const buildTrackStates = ({
  hideDefaultAudioTrackWhenMultiple,
  mutedTrackIndices,
  selectedTrackIndices,
  trackLabelByIndex,
}: {
  hideDefaultAudioTrackWhenMultiple: boolean;
  mutedTrackIndices: number[];
  selectedTrackIndices: number[];
  trackLabelByIndex: Map<number, string>;
}): TrackState[] => {
  const normalizedSelectedIndices = normalizeVisibleTrackIndices({
    hideDefaultAudioTrackWhenMultiple,
    trackIndices: selectedTrackIndices,
  });
  const normalizedMutedIndices = normalizeVisibleTrackIndices({
    hideDefaultAudioTrackWhenMultiple,
    trackIndices: mutedTrackIndices,
  });
  const allIndices = [...new Set([...normalizedSelectedIndices, ...normalizedMutedIndices])]
    .sort((left, right) => left - right);

  return allIndices.map((index) => ({
    index,
    isMuted: normalizedMutedIndices.includes(index),
    label: trackLabelByIndex.get(index) ?? `Track ${index + 1}`,
  }));
};

const toStatusLabel = (variant: ClipVariantEntry): string => variant.status.toUpperCase();

const toProgressLabel = (variant: ClipVariantEntry): string => {
  if (variant.status === 'exporting') {
    return 'EXPORTING';
  }

  if (variant.clip !== null || variant.status === 'exported' || variant.status === 'legacy') {
    return 'ON DISK';
  }

  return 'DRAFT';
};

const toExportProgressPercent = (variant: ClipVariantEntry): number => {
  if (variant.status !== 'exporting') {
    return 0;
  }

  const matchedPercentage = variant.progressText.match(/(\d+(?:\.\d+)?)%/);
  const rawValue = matchedPercentage ? Number(matchedPercentage[1]) : 0;

  if (!Number.isFinite(rawValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(rawValue)));
};

const toTrimModeLabel = (trimMode: ClipVariantEntry['trimMode']): string => (
  trimMode === 'fast' ? 'Quick' : 'Accurate'
);

const buildVariantTitle = (variant: ClipVariantEntry): string => (
  `${toTrimModeLabel(variant.trimMode)} variant`
);

function buildClipRows({
  clipEntries,
  draftVariantIds,
  hideDefaultAudioTrackWhenMultiple,
  trackLabelByIndex,
}: {
  clipEntries: ClipEntry[];
  draftVariantIds: Set<string>;
  hideDefaultAudioTrackWhenMultiple: boolean;
  trackLabelByIndex: Map<number, string>;
}): ClipRow[] {
  return clipEntries.map((clipEntry) => {
    const { range } = clipEntry;
    const variantRows = clipEntry.variantEntries.map((variant) => ({
      exportProgressPercent: toExportProgressPercent(variant),
      filePath: variant.filePath,
      hasTrustedClip: variant.clip !== null && variant.status !== 'foreign' && variant.status !== 'invalid',
      isDraftBacked: draftVariantIds.has(variant.key),
      key: variant.key,
      modifiedAtMs: variant.modifiedAtMs,
      range,
      trackStates: buildTrackStates({
        hideDefaultAudioTrackWhenMultiple,
        mutedTrackIndices: variant.mutedAudioTrackIndices,
        selectedTrackIndices: variant.selectedAudioTrackIndices,
        trackLabelByIndex,
      }),
      progressLabel: toProgressLabel(variant),
      variant,
      statusLabel: toStatusLabel(variant),
      title: buildVariantTitle(variant),
    }));

    return {
      range,
      sortStart: range.start,
      variantRows,
    };
  });
}

const compareClipRows = (left: ClipRow, right: ClipRow): number => (
  left.sortStart - right.sortStart || left.range.id.localeCompare(right.range.id)
);

const compareVariantRows = (left: VariantRow, right: VariantRow): number => {
  if (left.isDraftBacked !== right.isDraftBacked) {
    return left.isDraftBacked ? -1 : 1;
  }

  return (
    left.range.start - right.range.start
    || left.range.end - right.range.end
    || left.key.localeCompare(right.key)
  );
};

const toProgressBadgeClassName = (variantRow: VariantRow): string => {
  if (variantRow.progressLabel === 'EXPORTING') {
    return `${clipProgressBadge} ${clipProgressExporting}`;
  }

  if (variantRow.progressLabel === 'ON DISK') {
    return `${clipProgressBadge} ${clipProgressOnDisk}`;
  }

  return `${clipProgressBadge} ${clipProgressDraft}`;
};

export const EditorWindowSidebar = () => {
  const state = useClippingState();
  const {
    audioTracks,
    clipEntries,
    draftClipVariants,
    errorMessage,
    hideDefaultAudioTrackWhenMultiple,
    readyToStart,
  } = state;
  const {
    createVariantDuplicate,
    removeVariant,
    setSelectedVariant,
    setVariantTrimMode,
    startExport,
    toggleVariantAudioTrackMuted,
  } = useClippingActions(state);

  const trackLabelByIndex = useMemo(() => audioTracks.reduce(
    (nextMap, track: SourceAudioTrack) => nextMap.set(track.trackIndex, track.label),
    new Map<number, string>(),
  ), [audioTracks]);
  const draftVariantIds = useMemo(
    () => new Set(draftClipVariants.map((variant) => variant.id)),
    [draftClipVariants],
  );

  const clipRows = useMemo(() => buildClipRows({
    clipEntries,
    draftVariantIds,
    hideDefaultAudioTrackWhenMultiple,
    trackLabelByIndex,
  }), [clipEntries, draftVariantIds, hideDefaultAudioTrackWhenMultiple, trackLabelByIndex]);
  const visibleVariantRows = useMemo(
    () => clipRows
      .sort(compareClipRows)
      .flatMap((clipRow) => clipRow.variantRows)
      .sort(compareVariantRows),
    [clipRows],
  );

  const selectVariant = (rangeId: string, variantKey: string) => {
    setSelectedVariant(rangeId, variantKey);
  };

  const handleVariantCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    rangeId: string,
    variantKey: string,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    selectVariant(rangeId, variantKey);
  };

  return (
    <aside className={sideColumn}>
      <section className={`${panel} ${clipPanel}`}>
        <h2 className={panelHeading}>Clips List</h2>
        <ul className={clipList}>
          {visibleVariantRows.length === 0 && (
            <li className={clipMeta}>No clips planned or found on disk.</li>
          )}
          {visibleVariantRows.map((variantRow) => (
              <li key={variantRow.key}>
                <div
                  role="button"
                  tabIndex={0}
                  className={
                    [
                      clipVariantCard,
                      variantRow.isDraftBacked ? clipVariantCardDraft : clipVariantCardExisting,
                      state.selectedVariantId === variantRow.key ? clipVariantCardSelected : '',
                    ].filter(Boolean).join(' ')
                  }
                  onClick={() => {
                    selectVariant(variantRow.range.id, variantRow.key);
                  }}
                  onKeyDown={(event) => {
                    handleVariantCardKeyDown(event, variantRow.range.id, variantRow.key);
                  }}
                >
                  <div className={clipHeaderRow}>
                    <div className={clipTitle}>{variantRow.range.id}</div>
                    <div className={clipHeaderLabel}>
                      {formatSeconds(variantRow.range.start)}
                      {' - '}
                      {formatSeconds(variantRow.range.end)}
                    </div>
                  </div>
                  {variantRow.progressLabel === 'EXPORTING'
                    ? (
                      <div className={toProgressBadgeClassName(variantRow)}>
                        <div
                          aria-hidden="true"
                          className={clipProgressExportingFill}
                          style={{ inlineSize: `${variantRow.exportProgressPercent}%` }}
                        />
                        <span className={clipProgressExportingLabel}>
                          EXPORTING {variantRow.exportProgressPercent}%
                        </span>
                      </div>
                    )
                    : (
                      <div className={toProgressBadgeClassName(variantRow)}>
                        {variantRow.progressLabel}
                      </div>
                    )}
                  <div className={clipCardMetaRow}>
                    <SegmentedSwitch
                      ariaLabel={`Trim mode for ${variantRow.range.id}`}
                      className={clipSegmentedSwitch}
                      disabled={!variantRow.variant.isEditable}
                      optionClassName={clipSegmentedSwitchOption}
                      value={variantRow.variant.trimMode}
                      onChange={(nextMode) => {
                        if (!variantRow.variant.isEditable) {
                          return;
                        }

                        selectVariant(variantRow.range.id, variantRow.key);
                        setVariantTrimMode(
                          variantRow.range.id,
                          variantRow.key,
                          nextMode as TrimMode,
                        );
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
                    <div className={clipTrackGroup}>
                      <span className={clipTrackGroupLabel}>Tracks</span>
                      <div className={clipTrackChipRow} aria-label="Track selection">
                        {variantRow.trackStates.map((trackState) => (
                          <button
                            key={`${variantRow.key}:track:${trackState.index}`}
                            type="button"
                            disabled={!variantRow.variant.isEditable}
                            className={[
                              clipTrackChip,
                              clipTrackChipButton,
                              !variantRow.variant.isEditable ? clipTrackChipDisabled : '',
                              trackState.isMuted ? clipTrackChipMuted : clipTrackChipActive,
                            ].filter(Boolean).join(' ')}
                            aria-label={`${trackState.label} ${trackState.isMuted ? 'muted' : 'active'}`}
                            title={`${trackState.label} ${trackState.isMuted ? 'muted' : 'active'}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              selectVariant(variantRow.range.id, variantRow.key);
                              toggleVariantAudioTrackMuted(
                                variantRow.range.id,
                                variantRow.key,
                                trackState.index,
                              );
                            }}
                          >
                            {trackState.index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {variantRow.filePath && (
                    <TimelineEditorGeneratedClipPreview
                      filePath={variantRow.filePath}
                      modifiedAtMs={variantRow.modifiedAtMs ?? undefined}
                      title={variantRow.title}
                    />
                  )}
                  <div className={clipVariantActions}>
                    <Button
                      type="button"
                      variant="secondary"
                      className={clipActionButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        createVariantDuplicate(variantRow.range.id, variantRow.variant);
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className={clipActionButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeVariant(variantRow.range, variantRow.variant);
                      }}
                    >
                      Remove Item
                    </Button>
                  </div>
                </div>
              </li>
          ))}
        </ul>
      </section>

      <section className={`${panel} ${controlsPanel}`}>
        <h2 className={panelHeading}>Export</h2>
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
