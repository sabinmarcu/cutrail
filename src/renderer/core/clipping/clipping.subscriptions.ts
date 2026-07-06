import { useEffect } from 'react';

export const useClippingSubscriptions = ({ actions, state }) => {
  useEffect(() => {
    if (typeof globalThis.cutrail?.onExportProgress !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onExportProgress((progress) => {
      state.setProgressById((previous) => ({
        ...previous,
        [progress.jobId]: progress,
      }));
    });
  }, [state]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onSourceVideoSelected !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onSourceVideoSelected((nextPath) => {
      if (typeof nextPath !== 'string' || nextPath.length === 0) {
        return;
      }

      state.setSourcePath(nextPath);
      state.setRanges([]);
      state.setSelectedRangeId(null);
      state.setCurrentTime(0);
      state.setDuration(0);
      actions.pausePlayback();
      actions.resetPlan();
      state.setErrorMessage('');
    });
  }, [actions, state]);

  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getOutputDirectory !== 'function') {
      return undefined;
    }

    void globalThis.cutrail.getOutputDirectory().then((savedPath) => {
      if (mounted && typeof savedPath === 'string' && savedPath.length > 0) {
        state.setOutputDirectory(savedPath);
      }
    });

    return () => {
      mounted = false;
    };
  }, [state]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onOutputDirectoryUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onOutputDirectoryUpdated((nextPath) => {
      if (typeof nextPath === 'string' && nextPath.length > 0) {
        state.setOutputDirectory(nextPath);
      }
    });
  }, [state]);
};
