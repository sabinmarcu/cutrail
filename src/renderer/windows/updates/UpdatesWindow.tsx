import {
  useEffect,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/Button';
import { ProgressBar } from '@renderer/components/ProgressBar/ProgressBar';
import { UtilityWindow } from '@renderer/components/utility/UtilityWindow';
import {
  changelogSectionTitle,
  detailMarkdown,
  heading,
  message,
  olderVersionEntry,
  olderVersionsContainer,
  olderVersionHeading,
  panel,
  progressPanel,
} from './UpdatesWindow.css';

type UpdateDialogAction = {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary';
};

type UpdateDialogState = {
  title?: string;
  subtitle?: string;
  message?: string;
  detail?: string;
  latestDetail?: string;
  olderVersionDetails?: Array<{
    version?: string;
    notes?: string;
  }>;
  progressPercent?: number;
  progressLabel?: string;
  showProgress?: boolean;
  actions?: UpdateDialogAction[];
};

const defaultState: UpdateDialogState = {
  title: 'Cutrail Updates',
  subtitle: 'Updater dialog',
  message: 'Update information is unavailable.',
  actions: [{
    id: 'close',
    label: 'Close',
    variant: 'primary',
  }],
  progressPercent: 0,
  progressLabel: '0%',
  showProgress: false,
};

const parseUpdateDialogState = (payload: unknown): UpdateDialogState => {
  if (!payload || typeof payload !== 'object') {
    return defaultState;
  }

  const candidate = payload as UpdateDialogState;

  return {
    title: typeof candidate.title === 'string' && candidate.title.length > 0
      ? candidate.title
      : defaultState.title,
    subtitle: typeof candidate.subtitle === 'string' && candidate.subtitle.length > 0
      ? candidate.subtitle
      : defaultState.subtitle,
    message: typeof candidate.message === 'string' && candidate.message.length > 0
      ? candidate.message
      : defaultState.message,
    detail: typeof candidate.detail === 'string' && candidate.detail.length > 0
      ? candidate.detail
      : '',
    latestDetail: typeof candidate.latestDetail === 'string' && candidate.latestDetail.length > 0
      ? candidate.latestDetail
      : (typeof candidate.detail === 'string' ? candidate.detail : ''),
    olderVersionDetails: Array.isArray(candidate.olderVersionDetails)
      ? candidate.olderVersionDetails.filter((entry) => (
        !!entry
        && typeof entry.version === 'string'
        && entry.version.length > 0
        && typeof entry.notes === 'string'
        && entry.notes.length > 0
      ))
      : [],
    progressPercent: typeof candidate.progressPercent === 'number'
      ? candidate.progressPercent
      : (defaultState.progressPercent ?? 0),
    progressLabel: typeof candidate.progressLabel === 'string' && candidate.progressLabel.length > 0
      ? candidate.progressLabel
      : (defaultState.progressLabel ?? ''),
    showProgress: candidate.showProgress === true,
    actions: Array.isArray(candidate.actions) && candidate.actions.length > 0
      ? candidate.actions.filter((action): action is UpdateDialogAction => (
        !!action
        && typeof action.id === 'string'
        && action.id.length > 0
        && typeof action.label === 'string'
        && action.label.length > 0
      ))
      : defaultState.actions,
  };
};

export const UpdatesWindow = () => {
  const [dialog, setDialog] = useState<UpdateDialogState>(defaultState);
  const [submittingActionId, setSubmittingActionId] = useState('');

  useEffect(() => {
    let mounted = true;

    globalThis.cutrail?.getUpdateDialogState?.().then((payload) => {
      if (mounted) {
        setDialog(parseUpdateDialogState(payload));
      }
    });

    const unsubscribe = typeof globalThis.cutrail?.onUpdateDialogState === 'function'
      ? globalThis.cutrail.onUpdateDialogState((payload) => {
        setDialog(parseUpdateDialogState(payload));
      })
      : () => {};

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <UtilityWindow
      titleText={dialog.title ?? defaultState.title ?? 'Cutrail Updates'}
      subtitleText={dialog.subtitle ?? defaultState.subtitle ?? 'Updater dialog'}
      actionsSlot={(
        <>
          {(dialog.actions ?? defaultState.actions ?? []).map((action) => (
            <Button
              key={action.id}
              type="button"
              variant={action.variant ?? 'secondary'}
              disabled={submittingActionId.length > 0}
              onClick={() => {
                setSubmittingActionId(action.id);
                globalThis.cutrail?.submitUpdateDialogAction?.(action.id).finally(() => {
                  setSubmittingActionId('');
                });
              }}
            >
              {action.label}
            </Button>
          ))}
        </>
      )}
    >
      <section className={panel}>
        <h2 className={heading}>{dialog.title ?? defaultState.title}</h2>
        <p className={message}>{dialog.message ?? defaultState.message}</p>
        {dialog.latestDetail
          ? (
            <>
              <h3 className={changelogSectionTitle}>Latest Version</h3>
              <div className={detailMarkdown}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{dialog.latestDetail}</ReactMarkdown>
              </div>
            </>
          )
          : null}
        {Array.isArray(dialog.olderVersionDetails) && dialog.olderVersionDetails.length > 0
          ? (
            <div className={olderVersionsContainer}>
              <h3 className={changelogSectionTitle}>Previous Versions</h3>
              {dialog.olderVersionDetails.map((entry) => (
                <section key={entry.version} className={olderVersionEntry}>
                  <h4 className={olderVersionHeading}>{entry.version}</h4>
                  <div className={detailMarkdown}>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{entry.notes ?? ''}</ReactMarkdown>
                  </div>
                </section>
              ))}
            </div>
          )
          : null}
      </section>

      {dialog.showProgress
        ? (
          <section className={progressPanel}>
            <ProgressBar
              label={dialog.progressLabel ?? 'Download Progress'}
              showPercent
              value={dialog.progressPercent ?? 0}
            />
          </section>
        )
        : null}
    </UtilityWindow>
  );
};
