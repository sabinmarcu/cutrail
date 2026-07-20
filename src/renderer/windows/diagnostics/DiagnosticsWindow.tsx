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
import {
  heading,
  meta,
  panel,
  panelTone,
  runtime,
} from './DiagnosticsWindow.css';

export const DiagnosticsWindow = () => {
  const runtimeInfo: RuntimeInfo | null = globalThis.cutrail?.getRuntimeInfo?.() ?? null;
  const [ffmpegStatus, setFfmpegStatus] = useState<FfmpegAvailabilityResult | null>(null);

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
    </UtilityWindow>
  );
};
