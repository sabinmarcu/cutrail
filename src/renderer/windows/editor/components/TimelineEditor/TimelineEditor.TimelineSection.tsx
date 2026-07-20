import {
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Button } from '@renderer/components/Button';
import { SegmentedSwitch } from '@renderer/components/SegmentedSwitch';
import {
  clamp,
  useClippingActions,
  useClippingState,
} from '@renderer/core/clipping';
import type {
  ClipRange,
  TrimMode,
} from '@renderer/core/clipping/clipping.types';
import type { RangeDragMode } from './TimelineEditor';
import { useVisualPlaybackTime } from './TimelineEditor.useVisualPlaybackTime';
import { formatSeconds } from './TimelineEditor.utils';
import {
  handle,
  playhead,
  rangeBlock,
  timeline,
  timelineCenterControls,
  timelineControls,
  timelineLeadingControls,
  timelineSection,
  timelineTrailingControls,
  timelineWrap,
  timecode,
} from './TimelineEditor.css';

type TimelineEditorTimelineSectionProps = {
  onCreateDragHandler: (
    range: ClipRange,
    mode: RangeDragMode,
  ) => (event: ReactPointerEvent<HTMLElement>) => void;
};

export const TimelineEditorTimelineSection = ({
  onCreateDragHandler,
}: TimelineEditorTimelineSectionProps) => {
  const state = useClippingState();
  const {
    clipEntries,
    currentTime,
    duration,
    isPlaying,
    selectedRangeId,
    sourcePath,
    timelineRef,
    videoRef,
  } = state;
  const {
    addRangeAtPlayhead,
    createNewVariantFromSelection,
    setPlaybackTime,
    setSelectedRangeId,
    setTrimMode,
  } = useClippingActions(state);
  const isSeekingReference = useRef(false);
  const visualCurrentTime = useVisualPlaybackTime({
    currentTime,
    isPlaying,
    videoElementRef: videoRef,
  });

  const setPlaybackFromClientX = useCallback((clientX: number) => {
    if (!timelineRef.current || duration <= 0) {
      return;
    }

    const rect = timelineRef.current.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    setPlaybackTime(ratio * duration);
  }, [duration, setPlaybackTime, timelineRef]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!isSeekingReference.current) {
        return;
      }

      setPlaybackFromClientX(event.clientX);
    };

    const stopSeeking = () => {
      isSeekingReference.current = false;
    };

    globalThis.addEventListener('pointermove', onPointerMove);
    globalThis.addEventListener('pointerup', stopSeeking);
    globalThis.addEventListener('pointercancel', stopSeeking);

    return () => {
      globalThis.removeEventListener('pointermove', onPointerMove);
      globalThis.removeEventListener('pointerup', stopSeeking);
      globalThis.removeEventListener('pointercancel', stopSeeking);
    };
  }, [setPlaybackFromClientX]);

  return (
    <section className={timelineSection}>
      <div className={timelineControls}>
        <div className={timelineLeadingControls}>
          <Button
            type="button"
            variant="secondary"
            onClick={addRangeAtPlayhead}
            disabled={!sourcePath || duration <= 0}
          >
            Add Range
          </Button>
          {state.selectedRangeId && (
            <Button
              type="button"
              variant="secondary"
              onClick={createNewVariantFromSelection}
              disabled={!state.selectedVariantId || !state.selectedVariantIsEditable}
            >
              Duplicate
            </Button>
          )}
        </div>
        <div className={timelineCenterControls}>
          <SegmentedSwitch
            ariaLabel="Trim mode"
            disabled={!state.selectedVariantIsEditable}
            value={state.trimMode}
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
        <div className={timelineTrailingControls}>
          <span className={timecode}>
            {formatSeconds(visualCurrentTime)} / {formatSeconds(duration)}
          </span>
        </div>
      </div>

      <div className={timelineWrap}>
        <div
          className={timeline}
          ref={timelineRef}
          onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
            isSeekingReference.current = true;
            setPlaybackFromClientX(event.clientX);
          }}
        >
          <span
            className={playhead}
            style={{ insetInlineStart: `${duration > 0 ? (visualCurrentTime / duration) * 100 : 0}%` }}
          />
          {clipEntries.map((clipEntry) => {
            const { isLocked, range } = clipEntry;
            const left = duration > 0 ? (range.start / duration) * 100 : 0;
            const width = duration > 0 ? ((range.end - range.start) / duration) * 100 : 0;

            return (
              <button
                type="button"
                key={range.id}
                disabled={isLocked}
                data-timeline-range="true"
                className={rangeBlock({
                  locked: isLocked,
                  selected: selectedRangeId === range.id,
                })}
                style={{
                  insetInlineStart: `${left}%`,
                  inlineSize: `${Math.max(width, 0.5)}%`,
                }}
                onPointerDown={isLocked ? undefined : onCreateDragHandler(range, 'move')}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  setSelectedRangeId(range.id);
                }}
                aria-label={`Edit ${range.id}`}
              >
                <span data-timeline-range="true" className={handle({ side: 'start' })} onPointerDown={isLocked ? undefined : onCreateDragHandler(range, 'resize-start')} />
                <span data-timeline-range="true" className={handle({ side: 'end' })} onPointerDown={isLocked ? undefined : onCreateDragHandler(range, 'resize-end')} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
