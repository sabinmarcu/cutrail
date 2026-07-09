import {
  useEffect,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/Button';
import { UtilityWindow } from '@renderer/components/utility/UtilityWindow';
import {
  heading,
  meta,
  panel,
  runtimeMarkdown,
} from './LicensesWindow.css';

export const LicensesWindow = () => {
  const [noticesMarkdown, setNoticesMarkdown] = useState('Loading THIRD_PARTY_NOTICES.md...');

  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getThirdPartyNotices === 'function') {
      void globalThis.cutrail.getThirdPartyNotices().then((content) => {
        if (mounted) {
          setNoticesMarkdown(
            typeof content === 'string' && content.length > 0
              ? content
              : 'THIRD_PARTY_NOTICES.md content is unavailable in this build.',
          );
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <UtilityWindow
      titleText="Cutrail Licenses & Notices"
      subtitleText="Embedded license information for distributed installations."
      actionsSlot={(
        <Button type="button" variant="secondary" onClick={() => void globalThis.cutrail?.closeWindow?.()}>
          Close
        </Button>
      )}
    >
      <section className={panel}>
        <h2 className={heading}>FFmpeg Licensing</h2>
        <p className={meta}>
          Cutrail uses FFmpeg. FFmpeg is licensed under LGPL-2.1-or-later,
          and some distributed builds may include GPL components depending on enabled features.
        </p>
      </section>

      <section className={panel}>
        <h2 className={heading}>Third-Party Notices (Embedded)</h2>
        <div className={runtimeMarkdown}>
          <ReactMarkdown>{noticesMarkdown}</ReactMarkdown>
        </div>
      </section>
    </UtilityWindow>
  );
};
