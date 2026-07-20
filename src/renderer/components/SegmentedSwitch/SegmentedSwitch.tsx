import {
  disabledRoot,
  optionButton,
  root,
} from './SegmentedSwitch.css';

type SegmentedSwitchOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SegmentedSwitchProps<TValue extends string> = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  optionClassName?: string;
  onChange: (value: TValue) => void;
  options: Array<SegmentedSwitchOption<TValue>>;
  value: TValue;
};

export const SegmentedSwitch = <TValue extends string>(
  {
    ariaLabel,
    className,
    disabled = false,
    onChange,
    optionClassName,
    options,
    value,
  }: SegmentedSwitchProps<TValue>,
) => (
  <div
    className={[
      root,
      disabled ? disabledRoot : '',
      className ?? '',
    ].filter(Boolean).join(' ')}
    role="group"
    aria-label={ariaLabel}
    aria-disabled={disabled}
  >
    {options.map((option) => {
      const selected = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          className={optionClassName ? `${optionButton} ${optionClassName}` : optionButton}
          aria-pressed={selected}
          data-selected={selected ? 'true' : 'false'}
          disabled={disabled}
          onClick={() => {
            if (selected) {
              return;
            }

            onChange(option.value);
          }}
        >
          {option.label}
        </button>
      );
    })}
  </div>
  );
