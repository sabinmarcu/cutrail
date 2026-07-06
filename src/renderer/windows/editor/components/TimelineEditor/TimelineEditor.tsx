import { useState } from 'react';
import { useClippingContext } from '@renderer/core/clipping';
import {
  editorPanel,
  panelHeading,
} from '../../EditorWindow.css';
import { editor } from './TimelineEditor.css';
import { TimelineEditorPlaybackSection } from './TimelineEditor.PlaybackSection';
import { TimelineEditorRangeList } from './TimelineEditor.RangeList';
import { TimelineEditorTimelineSection } from './TimelineEditor.TimelineSection';
import { useTimelineRangeDrag } from './TimelineEditor.useRangeDrag';

export const TimelineEditor = ({ hideHeading = false, showRangeList = true }) => {
  const { setSelectedRangeId } = useClippingContext();
  const [dragState, setDragState] = useState(null);

  useTimelineRangeDrag({
    dragState,
    setDragState,
  });

  const createDragHandler = (range, mode) => (event) => {
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
