import { useState } from 'react';
import type { PointerEvent } from 'react';
import {
  useClippingActions,
  useClippingState,
} from '@renderer/core/clipping';
import type { ClipRange } from '@renderer/core/clipping/clipping.types';
import {
  editorPanel,
  panelHeading,
} from '../../EditorWindow.css';
import { editor } from './TimelineEditor.css';
import { TimelineEditorPlaybackSection } from './TimelineEditor.PlaybackSection';
import { TimelineEditorRangeList } from './TimelineEditor.RangeList';
import { TimelineEditorTimelineSection } from './TimelineEditor.TimelineSection';
import { useTimelineRangeDrag } from './TimelineEditor.useRangeDrag';

export type RangeDragMode = 'move' | 'resize-start' | 'resize-end';

export type RangeDragState = {
  id: string;
  mode: RangeDragMode;
  originX: number;
  originStart: number;
  originEnd: number;
};

type TimelineEditorProps = {
  hideHeading?: boolean;
  showRangeList?: boolean;
};

export const TimelineEditor = ({
  hideHeading = false,
  showRangeList = true,
}: TimelineEditorProps) => {
  const state = useClippingState();
  const { setSelectedRangeId } = useClippingActions(state);
  const [dragState, setDragState] = useState<RangeDragState | null>(null);

  useTimelineRangeDrag({
    dragState,
    setDragState,
  });

  const createDragHandler = (range: ClipRange, mode: RangeDragMode) => (
    event: PointerEvent<HTMLElement>,
  ) => {
    event.stopPropagation();
    setSelectedRangeId(range.id);
    setDragState({
      id: range.id,
      mode,
      originX: event.clientX,
      originStart: range.start,
      originEnd: range.end,
    });
  };

  return (
    <section className={editorPanel}>
      {!hideHeading && <h2 className={panelHeading}>Clip Timeline Editor</h2>}
      <div className={editor}>
        <TimelineEditorPlaybackSection />
        <TimelineEditorTimelineSection onCreateDragHandler={createDragHandler} />
        {showRangeList && <TimelineEditorRangeList />}
      </div>
    </section>
  );
};
