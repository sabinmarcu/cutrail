import { Button } from '@renderer/components/Button';
import { useClippingContext } from '@renderer/core/clipping';
import {
  rangeLabel,
  rangeList,
  rangeRow,
} from './TimelineEditor.RangeList.css';
import { formatSeconds } from './TimelineEditor.utils';

export const TimelineEditorRangeList = () => {
  const {
    ranges, removeRange, selectedRangeId,
  } = useClippingContext();

  return (
    <ul className={rangeList}>
      {ranges.map((range) => (
        <li key={range.id} className={rangeRow({ selected: selectedRangeId === range.id })}>
          <span className={rangeLabel}>{range.id}: {formatSeconds(range.start)} - {formatSeconds(range.end)}</span>
          <Button type="button" variant="danger" onClick={() => removeRange(range.id)}>Remove</Button>
        </li>
      ))}
    </ul>
  );
};
