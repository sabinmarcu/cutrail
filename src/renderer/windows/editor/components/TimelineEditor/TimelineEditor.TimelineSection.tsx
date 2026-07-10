import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Button } from '@renderer/components/Button';
import {
  clamp,
  useClippingActions,
  useClippingState,
} from '@renderer/core/clipping';
import { formatSeconds } from './TimelineEditor.utils';
import {
  handle,
  playhead,
  rangeBlock,
  timeline,
  timelineControls,
  timelineSection,
  timelineWrap,
  timecode,
} from './TimelineEditor.css';

export const TimelineEditorTimelineSection = ({ onCreateDragHandler }) => {
  const state = useClippingState();
  const {
    clipEntries,
    currentTime,
    duration,
    selectedRangeId,
    sourcePath,
    timelineRef,
  } = state;
  const {
    addRangeAtPlayhead,
    setPlaybackTime,
    setSelectedRangeId,
  } = useClippingActions(state);
  const isSeekingReference = useRef(false);

  const setPlaybackFromClientX = useCallback((clientX) => {
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
    const onPointerMove = (event) => {
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
        <Button
          type="button"
          variant="secondary"
          onClick={addRangeAtPlayhead}
          disabled={!sourcePath || duration <= 0}
        >
          Add Range
        </Button>
        <span className={timecode}>{formatSeconds(currentTime)} / {formatSeconds(duration)}</span>
      </div>

      <div className={timelineWrap}>
        <div
          className={timeline}
          ref={timelineRef}
          onPointerDown={(event) => {
            isSeekingReference.current = true;
            setPlaybackFromClientX(event.clientX);
          }}
        >
          <span className={playhead} style={{ insetInlineStart: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
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
                onClick={(event) => {
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
