import {
  optionButton,
  root,
} from './SegmentedSwitch.css';

type SegmentedSwitchOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SegmentedSwitchProps<TValue extends string> = {
  ariaLabel: string;
  onChange: (value: TValue) => void;
  options: Array<SegmentedSwitchOption<TValue>>;
  value: TValue;
};

export const SegmentedSwitch = <TValue extends string>(
  {
    ariaLabel,
    onChange,
    options,
    value,
  }: SegmentedSwitchProps<TValue>,
) => (
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
