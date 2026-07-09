import { Button } from '@renderer/components/Button';
import { SegmentedSwitch } from '@renderer/components/SegmentedSwitch';
import { useClippingContext } from '@renderer/core/clipping';
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

export const EditorWindowSidebar = () => {
  const {
    clipStatusMap, errorMessage, progressById, ranges, readyToStart, setTrimMode, startExport, trimMode,
  } = useClippingContext();

  return (
    <aside className={sideColumn}>
      <section className={`${panel} ${clipPanel}`}>
        <h2 className={panelHeading}>Clips List</h2>
        <ul className={clipList}>
          {ranges.length === 0 && <li className={clipMeta}>No clips planned.</li>}
          {ranges.map((range) => {
            const progress = progressById[range.id]?.ratio;
            const status = clipStatusMap[range.id] ?? 'DRAFT';

            return (
              <li key={range.id} className={clipItem}>
                <div className={clipTitle}>{range.id}</div>
                <div className={clipMeta}>Status: {status}</div>
                <div className={clipMeta}>
                  Progress: {progress === undefined || progress === null ? 'pending' : `${Math.round(progress * 100)}%`}
                </div>
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
