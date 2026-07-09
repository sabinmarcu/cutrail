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
  detailMarkdown,
  heading,
  message,
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

    void globalThis.cutrail?.getUpdateDialogState?.().then((payload) => {
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
                void globalThis.cutrail?.submitUpdateDialogAction?.(action.id).finally(() => {
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
        {dialog.detail
          ? (
            <div className={detailMarkdown}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{dialog.detail}</ReactMarkdown>
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
