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
  const [outputDirectory, setOutputDirectory] = useState('Loading...');

  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getOutputDirectory === 'function') {
      void globalThis.cutrail.getOutputDirectory().then((path) => {
        if (mounted) {
          setOutputDirectory(typeof path === 'string' && path.length > 0 ? path : 'Not configured');
        }
      });
    }

    if (typeof globalThis.cutrail?.onOutputDirectoryUpdated === 'function') {
      const unsubscribe = globalThis.cutrail.onOutputDirectoryUpdated((path) => {
        setOutputDirectory(typeof path === 'string' && path.length > 0 ? path : 'Not configured');
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <UtilityWindow
      titleText="Cutrail Options"
      subtitleText="Configure app-level behavior used by splash and editor windows."
    >
      <section className={panel}>
        <h2 className={heading}>Output Directory</h2>
        <p className={pathValue}>{outputDirectory}</p>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            void globalThis.cutrail?.selectOutputDirectory?.();
          }}
        >
          Change Output Directory
        </Button>
        <p className={helperText}>This path is used as the default export destination in the editor window.</p>
      </section>
    </UtilityWindow>
  );
};
