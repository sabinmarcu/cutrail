import {
  useEffect,
  useState,
} from 'react';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/Button';
import { UtilityWindow } from '@renderer/components/utility/UtilityWindow';
import {
  heading,
  helperText,
  panel,
  pathValue,
} from './OptionsWindow.css';

export const OptionsWindow = () => {
  const [sourceDirectory, setSourceDirectory] = useState('Loading...');
  const [outputDirectory, setOutputDirectory] = useState('Loading...');

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

    return () => {
      mounted = false;
      unsubscribeSource();
      unsubscribeOutput();
    };
  }, []);

  return (
    <UtilityWindow
      titleText="Cutrail Options"
      subtitleText="Configure app-level behavior used by splash and editor windows."
    >
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
    </UtilityWindow>
  );
};
