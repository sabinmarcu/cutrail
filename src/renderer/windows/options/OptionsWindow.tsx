import {
  useEffect,
  useState,
} from 'react';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/Button';
import { SegmentedSwitch } from '@renderer/components/SegmentedSwitch';
import { UtilityWindow } from '@renderer/components/utility/UtilityWindow';
import type {
  BinaryResolutionMode,
  WindowDecorationMenuPreferenceState,
} from '../../../shared/contracts';
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
  heading,
  headerControl,
  headerRow,
  helperText,
  panel,
  pathValue,
} from './OptionsWindow.css';

const binaryResolutionOptions: Array<{
  label: string;
  value: BinaryResolutionMode;
}> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Bundled', value: 'bundled' },
  { label: 'Local', value: 'local' },
];

const defaultWindowDecorationMenuPreference: WindowDecorationMenuPreferenceState = {
  configuredEnabled: false,
  effectiveEnabled: false,
  forcedByEnvironment: false,
};

export const OptionsWindow = () => {
  const [startupWindowMode, setStartupWindowMode] = useState<'splash' | 'library'>('splash');
  const [defaultTrimMode, setDefaultTrimMode] = useState<'fast' | 'accurate'>('fast');
  const [ffmpegResolutionMode, setFfmpegResolutionMode] = useState<BinaryResolutionMode>('auto');
  const [ffprobeResolutionMode, setFfprobeResolutionMode] = useState<BinaryResolutionMode>('auto');
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

    if (typeof globalThis.cutrail?.getDefaultTrimMode === 'function') {
      globalThis.cutrail.getDefaultTrimMode().then((mode) => {
        if (mounted) {
          setDefaultTrimMode(mode === 'accurate' ? 'accurate' : 'fast');
        }
      });
    }

    if (typeof globalThis.cutrail?.getFfmpegResolutionMode === 'function') {
      globalThis.cutrail.getFfmpegResolutionMode().then((mode) => {
        if (mounted) {
          setFfmpegResolutionMode(mode === 'bundled' || mode === 'local' ? mode : 'auto');
        }
      });
    }

    if (typeof globalThis.cutrail?.getFfprobeResolutionMode === 'function') {
      globalThis.cutrail.getFfprobeResolutionMode().then((mode) => {
        if (mounted) {
          setFfprobeResolutionMode(mode === 'bundled' || mode === 'local' ? mode : 'auto');
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

    const unsubscribeDefaultTrimMode = typeof globalThis.cutrail?.onDefaultTrimModeUpdated === 'function'
      ? globalThis.cutrail.onDefaultTrimModeUpdated((mode) => {
        setDefaultTrimMode(mode === 'accurate' ? 'accurate' : 'fast');
      })
      : () => {};

    const unsubscribeFfmpegResolutionMode = typeof globalThis.cutrail?.onFfmpegResolutionModeUpdated === 'function'
      ? globalThis.cutrail.onFfmpegResolutionModeUpdated((mode) => {
        setFfmpegResolutionMode(mode === 'bundled' || mode === 'local' ? mode : 'auto');
      })
      : () => {};

    const unsubscribeFfprobeResolutionMode = typeof globalThis.cutrail?.onFfprobeResolutionModeUpdated === 'function'
      ? globalThis.cutrail.onFfprobeResolutionModeUpdated((mode) => {
        setFfprobeResolutionMode(mode === 'bundled' || mode === 'local' ? mode : 'auto');
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
      unsubscribeDefaultTrimMode();
      unsubscribeFfmpegResolutionMode();
      unsubscribeFfprobeResolutionMode();
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
        <div className={headerRow}>
          <h2 className={heading}>Default Startup Window</h2>
          <div className={headerControl}>
            <SegmentedSwitch
              ariaLabel="Default startup window"
              value={startupWindowMode}
              onChange={(nextMode) => {
                const resolvedMode = nextMode === 'library' ? 'library' : 'splash';
                setStartupWindowMode(resolvedMode);
                globalThis.cutrail?.setStartupWindowMode?.(resolvedMode);
              }}
              options={[
                { label: 'Splash Screen', value: 'splash' },
                { label: 'Library Window', value: 'library' },
              ]}
            />
          </div>
        </div>
        <p className={helperText}>
          This controls what opens first when Cutrail starts or reopens with no windows.
        </p>
      </section>
      <section className={panel}>
        <div className={headerRow}>
          <h2 className={heading}>Default Trim Accuracy</h2>
          <div className={headerControl}>
            <SegmentedSwitch
              ariaLabel="Default trim accuracy"
              value={defaultTrimMode}
              onChange={(nextMode) => {
                const resolvedMode = nextMode === 'accurate' ? 'accurate' : 'fast';
                setDefaultTrimMode(resolvedMode);
                globalThis.cutrail?.setDefaultTrimMode?.(resolvedMode);
              }}
              options={[
                { label: 'Quick', value: 'fast' },
                { label: 'Accurate', value: 'accurate' },
              ]}
            />
          </div>
        </div>
        <p className={helperText}>
          Sets the default trim mode used for newly created clip variants in the editor.
        </p>
      </section>
      <section className={panel}>
        <div className={headerRow}>
          <h2 className={heading}>FFmpeg Resolution</h2>
          <div className={headerControl}>
            <SegmentedSwitch
              ariaLabel="FFmpeg resolution mode"
              value={ffmpegResolutionMode}
              onChange={(nextMode) => {
                setFfmpegResolutionMode(nextMode);
                globalThis.cutrail?.setFfmpegResolutionMode?.(nextMode);
              }}
              options={binaryResolutionOptions}
            />
          </div>
        </div>
        <p className={helperText}>
          Auto prefers the operating system ffmpeg, then the bundled binary.
          Bundled and Local force that source first.
        </p>
      </section>
      <section className={panel}>
        <div className={headerRow}>
          <h2 className={heading}>FFprobe Resolution</h2>
          <div className={headerControl}>
            <SegmentedSwitch
              ariaLabel="FFprobe resolution mode"
              value={ffprobeResolutionMode}
              onChange={(nextMode) => {
                setFfprobeResolutionMode(nextMode);
                globalThis.cutrail?.setFfprobeResolutionMode?.(nextMode);
              }}
              options={binaryResolutionOptions}
            />
          </div>
        </div>
        <p className={helperText}>
          Auto prefers the operating system ffprobe, then the ffmpeg sibling probe,
          then the separately bundled probe.
        </p>
      </section>
      <section className={panel}>
        <div className={headerRow}>
          <h2 className={heading}>Primary Accent Color</h2>
          {themePrimaryColor !== defaultThemePrimaryColor && (
            <div className={headerControl}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setThemePrimaryColor(defaultThemePrimaryColor);
                  globalThis.cutrail?.setThemePrimaryColor?.(defaultThemePrimaryColor);
                }}
              >
                Reset to Default
              </Button>
            </div>
          )}
        </div>
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
        <div className={headerRow}>
          <h2 className={heading}>Window Decoration Menu</h2>
        </div>
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
        <div className={headerRow}>
          <h2 className={heading}>Multi-Track Audio</h2>
        </div>
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
