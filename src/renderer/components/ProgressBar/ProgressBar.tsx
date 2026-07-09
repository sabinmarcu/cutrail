import {
  fill,
  labelRow,
  root,
  track,
} from './ProgressBar.css';

type ProgressBarProps = {
  label?: string;
  showPercent?: boolean;
  value: number;
};

const clampPercent = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
};

export const ProgressBar = ({
  label = 'Download Progress',
  showPercent = true,
  value,
}: ProgressBarProps) => {
  const percent = clampPercent(value);

  return (
    <div className={root}>
      <div className={labelRow}>
        <span>{label}</span>
        {showPercent ? <span>{percent.toFixed(1)}%</span> : null}
      </div>
      <div className={track} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className={fill} style={{ inlineSize: `${percent}%` }} />
      </div>
    </div>
  );
};
