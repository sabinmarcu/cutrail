import {
  useEffect,
  useState,
} from 'react';
import '@renderer/windows/globalReset.css';
import type {
  FfmpegAvailabilityResult,
  RuntimeInfo,
} from '@renderer/core/clipping/clipping.types';
import { UtilityWindow } from '@renderer/components/utility/UtilityWindow';
import type {
  OutputDirectorySnapshotPayload,
  SourceDirectorySnapshotPayload,
  WatcherHealthPayload,
} from '../../../shared/contracts.ts';
import {
  keyValueGrid,
  keyValueItem,
  heading,
  meta,
  panel,
  panelTone,
  runtime,
} from './DiagnosticsWindow.css';

export const DiagnosticsWindow = () => {
  const runtimeInfo: RuntimeInfo | null = globalThis.cutrail?.getRuntimeInfo?.() ?? null;
  const [ffmpegStatus, setFfmpegStatus] = useState<FfmpegAvailabilityResult | null>(null);
  const [sourceSnapshot, setSourceSnapshot] = useState<SourceDirectorySnapshotPayload | null>(null);
  const [outputSnapshot, setOutputSnapshot] = useState<OutputDirectorySnapshotPayload | null>(null);
  const [watcherHealth, setWatcherHealth] = useState<Partial<Record<'output' | 'source', WatcherHealthPayload>>>({});

  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getFfmpegDiagnostics === 'function') {
      globalThis.cutrail.getFfmpegDiagnostics().then((status) => {
        if (mounted) {
          setFfmpegStatus(status ?? null);
        }
      });
    } else {
      globalThis.cutrail?.checkFfmpeg?.().then((status) => {
        if (mounted) {
          setFfmpegStatus(status ?? null);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onSourceDirectorySnapshotUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onSourceDirectorySnapshotUpdated((payload) => {
      setSourceSnapshot(payload);
    });
  }, []);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onOutputDirectorySnapshotUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onOutputDirectorySnapshotUpdated((payload) => {
      setOutputSnapshot(payload);
    });
  }, []);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onWatcherHealthUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onWatcherHealthUpdated((payload) => {
      setWatcherHealth((previous) => ({
        ...previous,
        [payload.watcherType]: payload,
      }));
    });
  }, []);

  useEffect(() => {
    globalThis.cutrail?.getVideoLibrary?.().catch(() => {});

    Promise.all([
      globalThis.cutrail?.getSourceDirectory?.(),
      globalThis.cutrail?.getOutputDirectory?.(),
    ]).then(([sourcePath, outputDirectory]) => {
      if (!sourcePath || !outputDirectory) {
        return;
      }

      globalThis.cutrail?.syncExistingExportClips?.({
        sourcePath,
        outputDirectory,
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const outputClipCounts = outputSnapshot?.clips.reduce<Record<string, number>>(
    (accumulator, clip) => {
      const key = clip.classificationKind ?? 'legacy';

      accumulator[key] = (accumulator[key] ?? 0) + 1;

      return accumulator;
    },
    {},
  ) ?? {};
  const sourceVideoCounts = sourceSnapshot?.videos.reduce((accumulator, video) => ({
    legacy: accumulator.legacy + (video.hasLegacyClips ? 1 : 0),
    metadata: accumulator.metadata + (video.hasMetadataClips ? 1 : 0),
  }), {
    legacy: 0,
    metadata: 0,
  }) ?? {
    legacy: 0,
    metadata: 0,
  };
  const sourceWatcherHealthText = watcherHealth.source
    ? `${watcherHealth.source.state} (${watcherHealth.source.reason})`
    : 'unavailable';
  const outputWatcherHealthText = watcherHealth.output
    ? `${watcherHealth.output.state} (${watcherHealth.output.reason})`
    : 'unavailable';
  const sourceChangeSummaryText = sourceSnapshot
    ? `+${sourceSnapshot.changeSummary.added} ~${sourceSnapshot.changeSummary.changed} -${sourceSnapshot.changeSummary.removed}`
    : 'unavailable';
  const outputChangeSummaryText = outputSnapshot
    ? `+${outputSnapshot.changeSummary.added} ~${outputSnapshot.changeSummary.changed} -${outputSnapshot.changeSummary.removed}`
    : 'unavailable';

  return (
    <UtilityWindow
      titleText="Cutrail Diagnostics"
      subtitleText="Runtime diagnostics for troubleshooting local FFmpeg and environment setup."
    >
      <section className={`${panel} ${panelTone({ tone: ffmpegStatus?.available ? 'success' : 'danger' })}`}>
        <h2 className={heading}>FFmpeg Runtime</h2>
        <p className={meta}>
          {ffmpegStatus === null
            ? 'Checking ffmpeg availability...'
            : (ffmpegStatus.available
              ? `Ready (${ffmpegStatus.source})`
              : `Unavailable (${ffmpegStatus.code})`)}
        </p>
        {ffmpegStatus && (
          <p className={meta}>
            {ffmpegStatus.available
              ? `${ffmpegStatus.versionLine ?? 'ffmpeg detected'} | ${ffmpegStatus.path}`
              : `${ffmpegStatus.error ?? 'ffmpeg could not be resolved'} | ${ffmpegStatus.path ?? 'no path'}`}
          </p>
        )}
      </section>

      <section className={panel}>
        <h2 className={heading}>Runtime</h2>
        <pre className={runtime}>
          {runtimeInfo ? JSON.stringify(runtimeInfo, null, 2) : 'runtime info unavailable'}
        </pre>
      </section>

      <section className={panel}>
        <h2 className={heading}>Watcher Health</h2>
        <div className={keyValueGrid}>
          <p className={keyValueItem}>Source: {sourceWatcherHealthText}</p>
          <p className={keyValueItem}>Output: {outputWatcherHealthText}</p>
        </div>
      </section>

      <section className={panel}>
        <h2 className={heading}>Clip Classification</h2>
        <div className={keyValueGrid}>
          <p className={keyValueItem}>
            Source videos with metadata clips: {sourceVideoCounts.metadata}
          </p>
          <p className={keyValueItem}>
            Source videos with legacy clips: {sourceVideoCounts.legacy}
          </p>
          <p className={keyValueItem}>Metadata clips: {outputClipCounts.metadata ?? 0}</p>
          <p className={keyValueItem}>Legacy clips: {outputClipCounts.legacy ?? 0}</p>
          <p className={keyValueItem}>Foreign clips: {outputClipCounts.foreign ?? 0}</p>
          <p className={keyValueItem}>Invalid clips: {outputClipCounts.invalid ?? 0}</p>
          <p className={keyValueItem}>
            Source snapshot change summary: {sourceChangeSummaryText}
          </p>
          <p className={keyValueItem}>
            Output snapshot change summary: {outputChangeSummaryText}
          </p>
        </div>
      </section>
    </UtilityWindow>
  );
};
