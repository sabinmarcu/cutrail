import {
  Maximize2,
  Minus,
  X,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import type { WindowDecorationMenuPreferenceState } from '../../../shared/contracts';
import { WindowDecorationAppMenu } from './WindowDecoration.AppMenu';
import {
  closeButton,
  controls,
  dragRegion,
  menuRow,
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
}: WindowDecorationProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuPreference, setMenuPreference] = useState<WindowDecorationMenuPreferenceState>({
    configuredEnabled: false,
    effectiveEnabled: false,
    forcedByEnvironment: false,
  });

  useEffect(() => {
    globalThis.cutrail?.getWindowFullscreenState?.().then((fullscreenState) => {
      setIsFullscreen(fullscreenState);
    }).catch(() => {
      setIsFullscreen(false);
    });

    if (typeof globalThis.cutrail?.onWindowFullscreenStateUpdated !== 'function') {
      return () => {};
    }

    return globalThis.cutrail.onWindowFullscreenStateUpdated((fullscreenState) => {
      setIsFullscreen(fullscreenState);
    });
  }, []);

  useEffect(() => {
    globalThis.cutrail?.getWindowDecorationMenuPreference?.().then((nextPreference) => {
      setMenuPreference(nextPreference);
    }).catch(() => {
      setMenuPreference({
        configuredEnabled: false,
        effectiveEnabled: false,
        forcedByEnvironment: false,
      });
    });

    if (typeof globalThis.cutrail?.onWindowDecorationMenuPreferenceUpdated !== 'function') {
      return () => {};
    }

    return globalThis.cutrail.onWindowDecorationMenuPreferenceUpdated((nextPreference) => {
      setMenuPreference(nextPreference);
    });
  }, []);

  if (isFullscreen) {
    return null;
  }

  return (
    <header className={root({ variant })}>
      <div className={titleGroup}>
        {titleText ? <h1 className={title}>{titleText}</h1> : <div className={dragRegion} />}
        {subtitleText ? <p className={subtitle}>{subtitleText}</p> : null}
      </div>
      <div className={controls}>
        <button type="button" className={windowButton({ tone: 'soft' })} aria-label="Minimize window" onClick={minimizeWindow}>
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <button type="button" className={windowButton({ tone: 'accent' })} aria-label="Toggle fullscreen" onClick={toggleWindowMaximize}>
          <Maximize2 size={13} strokeWidth={2.5} />
        </button>
        <button type="button" className={closeButton} aria-label="Close window" onClick={closeWindow}>
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
      {menuPreference.effectiveEnabled
        ? (
        <div className={menuRow}>
          <WindowDecorationAppMenu />
        </div>
        )
        : null}
    </header>
  );
};
