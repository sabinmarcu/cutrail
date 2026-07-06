import { useEffect } from 'react';
import {
  clamp,
  MIN_RANGE_DURATION,
  useClippingContext,
} from '@renderer/core/clipping';

export const useTimelineRangeDrag = ({ dragState, setDragState }) => {
  const {
    duration, ranges, resetPlan, setRanges, timelineRef,
  } = useClippingContext();

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const onPointerMove = (event) => {
      if (duration <= 0) {
        return;
      }

      const timelineNode = timelineRef.current;

      if (!timelineNode) {
        return;
      }

      const rect = timelineNode.getBoundingClientRect();

      if (rect.width <= 0) {
        return;
      }

      const deltaX = event.clientX - dragState.originX;
      const deltaSeconds = (deltaX / rect.width) * duration;
      const nextRanges = ranges.map((range) => {
        if (range.id !== dragState.id) {
          return range;
        }

        if (dragState.mode === 'move') {
          const span = dragState.originEnd - dragState.originStart;
          const nextStart = clamp(dragState.originStart + deltaSeconds, 0, Math.max(0, duration - span));

          return {
            ...range,
            start: Number(nextStart.toFixed(3)),
            end: Number((nextStart + span).toFixed(3)),
          };
        }

        if (dragState.mode === 'resize-start') {
          const nextStart = clamp(dragState.originStart + deltaSeconds, 0, dragState.originEnd - MIN_RANGE_DURATION);

          return {
            ...range,
            start: Number(nextStart.toFixed(3)),
          };
        }

        const nextEnd = clamp(dragState.originEnd + deltaSeconds, dragState.originStart + MIN_RANGE_DURATION, duration);

        return {
          ...range,
          end: Number(nextEnd.toFixed(3)),
        };
      });

      setRanges(nextRanges);
      resetPlan();
    };

    const onPointerUp = () => {
      setDragState(null);
    };

    globalThis.addEventListener('pointermove', onPointerMove);
    globalThis.addEventListener('pointerup', onPointerUp);

    return () => {
      globalThis.removeEventListener('pointermove', onPointerMove);
      globalThis.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragState, duration, ranges, resetPlan, setDragState, setRanges, timelineRef]);
};
