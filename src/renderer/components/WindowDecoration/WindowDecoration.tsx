import {
  Maximize2,
  Minus,
  X,
} from 'lucide-react';
import {
  closeButton,
  controls,
  dragRegion,
  root,
  subtitle,
  title,
  titleGroup,
  windowButton,
} from './WindowDecoration.css';

const closeWindow = () => {
  globalThis.cutrail?.closeWindow?.();
};

const minimizeWindow = () => {
  globalThis.cutrail?.minimizeWindow?.();
};

const toggleWindowMaximize = () => {
  globalThis.cutrail?.toggleWindowMaximize?.();
};

type WindowDecorationProps = {
  subtitleText?: string;
  titleText?: string;
  variant?: 'bar' | 'overlay';
};

export const WindowDecoration = ({
  subtitleText = '', titleText = '', variant = 'bar',
}: WindowDecorationProps) => (
  <header className={root({ variant })}>
    <div className={titleGroup}>
      {titleText ? <h1 className={title}>{titleText}</h1> : <div className={dragRegion} />}
      {subtitleText ? <p className={subtitle}>{subtitleText}</p> : null}
    </div>
    <div className={controls}>
      <button type="button" className={windowButton({ tone: 'soft' })} aria-label="Minimize window" onClick={minimizeWindow}>
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <button type="button" className={windowButton({ tone: 'accent' })} aria-label="Maximize or restore window" onClick={toggleWindowMaximize}>
        <Maximize2 size={13} strokeWidth={2.5} />
      </button>
      <button type="button" className={closeButton} aria-label="Close window" onClick={closeWindow}>
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  </header>
);
