import {
  useId,
  useMemo,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import {
  rangeCoverageBadge,
  rangeCoverageBadgeCount,
  rangeCoverageBadgeIcon,
  rangeCoverageOverlayRow,
  rangeCoverageTooltip,
} from './TimelineEditor.RangeCoverageBadge.css';

type RangeCoverageKind = 'draft' | 'exporting' | 'exported';

type CoverageBadge = {
  count: number;
  kind: RangeCoverageKind;
  icon: string;
  tooltip: string;
};

type TimelineEditorRangeCoverageBadgeProps = {
  draftCount: number;
  exportedCount: number;
  exportingCount: number;
  leftPercent: number;
  widthPercent: number;
};

type CoverageBadgeItemProps = {
  count: number;
  kind: RangeCoverageKind;
  icon: string;
  tooltip: string;
};

const computeTooltipPosition = (
  buttonElement: HTMLButtonElement,
  tooltipElement: HTMLDivElement,
) => {
  const rect = buttonElement.getBoundingClientRect();
  const maxX = globalThis.innerWidth - 12;
  const minX = 12;
  const centeredX = rect.left + rect.width / 2;
  const tooltipHalfWidth = tooltipElement.offsetWidth / 2;
  const clampedX = Math.min(Math.max(centeredX, minX + tooltipHalfWidth), maxX - tooltipHalfWidth);

  tooltipElement.style.setProperty('--tooltip-x', `${clampedX}px`);
  tooltipElement.style.setProperty('--tooltip-y', `${rect.top}px`);
};

const buildCoverageBadges = (
  draftCount: number,
  exportedCount: number,
  exportingCount: number,
) => {
  const nextBadges: CoverageBadge[] = [];

  if (exportedCount > 0) {
    nextBadges.push({
      count: exportedCount,
      kind: 'exported',
      icon: '✓',
      tooltip: `Exported: ${exportedCount}`,
    });
  }

  if (exportingCount > 0) {
    nextBadges.push({
      count: exportingCount,
      kind: 'exporting',
      icon: '↻',
      tooltip: `Rendering: ${exportingCount}`,
    });
  }

  if (draftCount > 0) {
    nextBadges.push({
      count: draftCount,
      kind: 'draft',
      icon: '•',
      tooltip: `Draft: ${draftCount}`,
    });
  }

  return nextBadges;
};

const CoverageBadgeItem = ({
  count,
  kind,
  icon,
  tooltip,
}: CoverageBadgeItemProps) => {
  const tooltipId = useId();
  const tooltipReference = useRef<HTMLDivElement | null>(null);

  const openTooltip = (event: FocusEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
    const tooltipElement = tooltipReference.current;

    if (!tooltipElement) {
      return;
    }

    const buttonElement = event.currentTarget;

    if (!tooltipElement.matches(':popover-open')) {
      tooltipElement.showPopover();
    }

    globalThis.requestAnimationFrame(() => {
      if (!tooltipElement.matches(':popover-open')) {
        return;
      }

      computeTooltipPosition(buttonElement, tooltipElement);
    });
  };

  const closeTooltip = () => {
    const tooltipElement = tooltipReference.current;

    if (!tooltipElement) {
      return;
    }

    if (tooltipElement.matches(':popover-open')) {
      tooltipElement.hidePopover();
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      closeTooltip();
    }
  };

  return (
    <>
      <button
        type="button"
        className={rangeCoverageBadge({ tone: kind })}
        aria-describedby={tooltipId}
        aria-label={tooltip}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        onKeyDown={onKeyDown}
      >
        <span className={rangeCoverageBadgeIcon} aria-hidden="true">{icon}</span>
        <span className={rangeCoverageBadgeCount}>{count}</span>
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        popover="manual"
        ref={tooltipReference}
        className={rangeCoverageTooltip}
      >
        {tooltip}
      </div>
    </>
  );
};

export const TimelineEditorRangeCoverageBadge = ({
  draftCount,
  exportedCount,
  exportingCount,
  leftPercent,
  widthPercent,
}: TimelineEditorRangeCoverageBadgeProps) => {
  const badges = useMemo<CoverageBadge[]>(
    () => buildCoverageBadges(draftCount, exportedCount, exportingCount),
    [draftCount, exportedCount, exportingCount],
  );

  if (badges.length === 0) {
    return null;
  }

  return (
    <span
      className={rangeCoverageOverlayRow}
      style={{
        insetInlineStart: `${leftPercent}%`,
        inlineSize: `${Math.max(widthPercent, 0.5)}%`,
      }}
    >
      {badges.map((badge, index) => (
        <CoverageBadgeItem
          key={`${badge.kind}-${index}`}
          kind={badge.kind}
          icon={badge.icon}
          count={badge.count}
          tooltip={badge.tooltip}
        />
      ))}
    </span>
  );
};
