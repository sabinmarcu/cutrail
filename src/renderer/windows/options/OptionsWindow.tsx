import {
  useEffect,
  useState,
} from 'react';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/Button';
import { UtilityWindow } from '@renderer/components/utility/UtilityWindow';
import type { WindowDecorationMenuPreferenceState } from '../../../shared/contracts';
import {
  defaultThemePrimaryColor,
  isThemePrimaryColorValue,
  normalizeThemePrimaryColor,
  type ThemePrimaryColorValue,
} from '../../../shared/themePrimaryColor';
import {
  checkboxInput,
  checkboxLabel,
  checkboxRow,
  colorControlRow,
  colorInput,
  colorValue,
  controlSelect,
  heading,
  helperText,
  panel,
  pathValue,
} from './OptionsWindow.css';

const defaultWindowDecorationMenuPreference: WindowDecorationMenuPreferenceState = {
  configuredEnabled: false,
  effectiveEnabled: false,
  forcedByEnvironment: false,
};

export const OptionsWindow = () => {
  const [startupWindowMode, setStartupWindowMode] = useState<'splash' | 'library'>('splash');
  const [themePrimaryColor, setThemePrimaryColor] = useState<ThemePrimaryColorValue>(
    defaultThemePrimaryColor,
  );
  const [sourceDirectory, setSourceDirectory] = useState('Loading...');
  const [outputDirectory, setOutputDirectory] = useState('Loading...');
  const [hideDefaultAudioTrackWhenMultiple, setHideDefaultAudioTrackWhenMultiple] = useState(false);
  const [windowDecorationMenuPreference, setWindowDecorationMenuPreference] = useState(
    defaultWindowDecorationMenuPreference,
  );
  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getSourceDirectory === 'function') {
      globalThis.cutrail.getSourceDirectory().then((path) => {
        if (mounted) {
          setSourceDirectory(typeof path === 'string' && path.length > 0 ? path : 'Not configured');
        }
      });
    }

    if (typeof globalThis.cutrail?.getOutputDirectory === 'function') {
      globalThis.cutrail.getOutputDirectory().then((path) => {
        if (mounted) {
          setOutputDirectory(typeof path === 'string' && path.length > 0 ? path : 'Not configured');
        }
      });
    }

    if (typeof globalThis.cutrail?.getStartupWindowMode === 'function') {
      globalThis.cutrail.getStartupWindowMode().then((mode) => {
        if (mounted) {
          setStartupWindowMode(mode === 'library' ? 'library' : 'splash');
        }
      });
    }

    if (typeof globalThis.cutrail?.getThemePrimaryColor === 'function') {
      globalThis.cutrail.getThemePrimaryColor().then((color) => {
        if (mounted && isThemePrimaryColorValue(color)) {
          setThemePrimaryColor(normalizeThemePrimaryColor(color));
        }
      });
    }

    if (typeof globalThis.cutrail?.getHideDefaultAudioTrackWhenMultiple === 'function') {
      globalThis.cutrail.getHideDefaultAudioTrackWhenMultiple().then((value) => {
        if (mounted) {
          setHideDefaultAudioTrackWhenMultiple(value === true);
        }
      });
    }

    if (typeof globalThis.cutrail?.getWindowDecorationMenuPreference === 'function') {
      globalThis.cutrail.getWindowDecorationMenuPreference().then((nextPreference) => {
        if (mounted) {
          setWindowDecorationMenuPreference(nextPreference);
        }
      });
    }

    const unsubscribeSource = typeof globalThis.cutrail?.onSourceDirectoryUpdated === 'function'
      ? globalThis.cutrail.onSourceDirectoryUpdated((path) => {
        setSourceDirectory(typeof path === 'string' && path.length > 0 ? path : 'Not configured');
      })
      : () => {};

    const unsubscribeOutput = typeof globalThis.cutrail?.onOutputDirectoryUpdated === 'function'
      ? globalThis.cutrail.onOutputDirectoryUpdated((path) => {
        setOutputDirectory(typeof path === 'string' && path.length > 0 ? path : 'Not configured');
      })
      : () => {};

    const unsubscribeStartupMode = typeof globalThis.cutrail?.onStartupWindowModeUpdated === 'function'
      ? globalThis.cutrail.onStartupWindowModeUpdated((mode) => {
        setStartupWindowMode(mode === 'library' ? 'library' : 'splash');
      })
      : () => {};

    const unsubscribeThemePrimaryColor = typeof globalThis.cutrail?.onThemePrimaryColorUpdated === 'function'
      ? globalThis.cutrail.onThemePrimaryColorUpdated((color) => {
        if (isThemePrimaryColorValue(color)) {
          setThemePrimaryColor(normalizeThemePrimaryColor(color));
        }
      })
      : () => {};

    const unsubscribeHideDefaultAudioTrack = typeof globalThis.cutrail?.onHideDefaultAudioTrackWhenMultipleUpdated === 'function'
      ? globalThis.cutrail.onHideDefaultAudioTrackWhenMultipleUpdated((value) => {
        setHideDefaultAudioTrackWhenMultiple(value === true);
      })
      : () => {};

    const unsubscribeWindowDecorationMenuPreference = typeof globalThis.cutrail?.onWindowDecorationMenuPreferenceUpdated === 'function'
      ? globalThis.cutrail.onWindowDecorationMenuPreferenceUpdated((nextPreference) => {
        setWindowDecorationMenuPreference(nextPreference);
      })
      : () => {};

    return () => {
      mounted = false;
      unsubscribeSource();
      unsubscribeOutput();
      unsubscribeStartupMode();
      unsubscribeThemePrimaryColor();
      unsubscribeHideDefaultAudioTrack();
      unsubscribeWindowDecorationMenuPreference();
    };
  }, []);

  return (
    <UtilityWindow
      titleText="Cutrail Options"
      subtitleText="Configure app-level behavior used by splash and editor windows."
    >
      <section className={panel}>
        <h2 className={heading}>Default Startup Window</h2>
        <select
          className={controlSelect}
          value={startupWindowMode}
          onChange={(event) => {
            const nextMode = event.currentTarget.value === 'library' ? 'library' : 'splash';
            setStartupWindowMode(nextMode);
            globalThis.cutrail?.setStartupWindowMode?.(nextMode);
          }}
        >
          <option value="splash">Splash Screen</option>
          <option value="library">Library Window</option>
        </select>
        <p className={helperText}>
          This controls what opens first when Cutrail starts or reopens with no windows.
        </p>
      </section>
      <section className={panel}>
        <h2 className={heading}>Primary Accent Color</h2>
        <div className={colorControlRow}>
          <input
            className={colorInput}
            type="color"
            value={themePrimaryColor}
            onChange={(event) => {
              const nextValue = normalizeThemePrimaryColor(event.currentTarget.value);

              if (!isThemePrimaryColorValue(nextValue)) {
                return;
              }

              setThemePrimaryColor(nextValue);
              globalThis.cutrail?.setThemePrimaryColor?.(nextValue);
            }}
          />
          <span className={colorValue}>{themePrimaryColor.toUpperCase()}</span>
        </div>
        <p className={helperText}>
          Controls the terminal-style glow/accent used across renderer windows.
        </p>
      </section>
      <section className={panel}>
        <h2 className={heading}>Source Folder</h2>
        <p className={pathValue}>{sourceDirectory}</p>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            globalThis.cutrail?.selectSourceDirectory?.();
          }}
        >
          Change Source Folder
        </Button>
        <p className={helperText}>
          New videos for the library window are scanned from this directory.
        </p>
      </section>

      <section className={panel}>
        <h2 className={heading}>Output Directory</h2>
        <p className={pathValue}>{outputDirectory}</p>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            globalThis.cutrail?.selectOutputDirectory?.();
          }}
        >
          Change Output Directory
        </Button>
        <p className={helperText}>
          This path is used as the default export destination in the editor window.
        </p>
      </section>
      <section className={panel}>
        <h2 className={heading}>Window Decoration Menu</h2>
        <label className={checkboxRow}>
          <input
            className={checkboxInput}
            type="checkbox"
            checked={windowDecorationMenuPreference.configuredEnabled}
            disabled={windowDecorationMenuPreference.forcedByEnvironment}
            onChange={(event) => {
              const nextValue = event.currentTarget.checked;
              globalThis.cutrail?.setWindowDecorationMenuPreference?.(nextValue)
                .then((nextPreference) => {
                  setWindowDecorationMenuPreference(nextPreference);
                });
            }}
          />
          <span className={checkboxLabel}>
            Show the in-window menu strip below the titlebar.
          </span>
        </label>
        <p className={helperText}>
          {windowDecorationMenuPreference.forcedByEnvironment
            ? 'Forced on by CUTRAIL_FORCE_WINDOW_DECORATION_MENU.'
            : 'Default is seeded from environment detection on first run.'}
        </p>
      </section>
      <section className={panel}>
        <h2 className={heading}>Multi-Track Audio</h2>
        <label className={checkboxRow}>
          <input
            className={checkboxInput}
            type="checkbox"
            checked={hideDefaultAudioTrackWhenMultiple}
            onChange={(event) => {
              const nextValue = event.currentTarget.checked;
              setHideDefaultAudioTrackWhenMultiple(nextValue);
              globalThis.cutrail?.setHideDefaultAudioTrackWhenMultiple?.(nextValue);
            }}
          />
          <span className={checkboxLabel}>
            Hide the default audio track when a source has multiple audio tracks.
          </span>
        </label>
        <p className={helperText}>
          When enabled, only non-default tracks are shown in the editor and counted
          for clip exports.
        </p>
      </section>
    </UtilityWindow>
  );
};
