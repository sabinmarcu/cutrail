import { Button } from '@renderer/components/Button';
import {
  useClippingActions,
  useClippingState,
} from '@renderer/core/clipping';
import {
  rangeLabel,
  rangeList,
  rangeRow,
} from './TimelineEditor.RangeList.css';
import { formatSeconds } from './TimelineEditor.utils';

export const TimelineEditorRangeList = () => {
  const state = useClippingState();
  const { clipEntries, selectedRangeId } = state;
  const { removeRange } = useClippingActions(state);

  return (
    <ul className={rangeList}>
      {clipEntries.map((clipEntry) => (
        <li
          key={clipEntry.range.id}
          className={rangeRow({ selected: selectedRangeId === clipEntry.range.id })}
        >
          <span className={rangeLabel}>
            {clipEntry.range.id}: {formatSeconds(clipEntry.range.start)}
            {' - '}
            {formatSeconds(clipEntry.range.end)}
          </span>
          <Button
            type="button"
            variant="danger"
            onClick={() => removeRange(clipEntry.range.id)}
            disabled={clipEntry.isLocked}
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
};
