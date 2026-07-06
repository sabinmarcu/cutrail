import {
  optionButton,
  root,
} from './segmentedSwitch.css';

export const SegmentedSwitch = ({
  ariaLabel, onChange, options, value,
}) => (
    <div className={root} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={optionButton}
            disabled={selected}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
);
