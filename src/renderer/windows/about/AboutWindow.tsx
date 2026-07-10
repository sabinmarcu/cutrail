import {
  useEffect,
  useState,
} from 'react';
import logoPath from '@assets/logo-green.svg';
import '@renderer/windows/globalReset.css';
import { WindowDecoration } from '@renderer/components/WindowDecoration';
import {
  infoGrid,
  infoLabel,
  infoValue,
  hero,
  icon,
  link,
  linkRow,
  page,
  panel,
  shell,
  subtitle,
  title,
} from './AboutWindow.css';

type AppMetadata = {
  version: string;
  copyright: string;
  attribution: string;
  license: string;
};

const defaultMetadata: AppMetadata = {
  version: 'Unavailable',
  copyright: 'Copyright information unavailable.',
  attribution: 'Attribution information unavailable.',
  license: 'License information unavailable.',
};

export const AboutWindow = () => {
  const [appMetadata, setAppMetadata] = useState<AppMetadata>(defaultMetadata);

  useEffect(() => {
    let mounted = true;

    globalThis.cutrail?.getAppMetadata?.().then((metadata) => {
      if (!mounted || !metadata) {
        return;
      }

      setAppMetadata({
        version: typeof metadata.version === 'string' && metadata.version.length > 0
          ? metadata.version
          : defaultMetadata.version,
        copyright: typeof metadata.copyright === 'string' && metadata.copyright.length > 0
          ? metadata.copyright
          : defaultMetadata.copyright,
        attribution: typeof metadata.attribution === 'string' && metadata.attribution.length > 0
          ? metadata.attribution
          : defaultMetadata.attribution,
        license: typeof metadata.license === 'string' && metadata.license.length > 0
          ? metadata.license
          : defaultMetadata.license,
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className={page}>
      <section className={shell}>
        <WindowDecoration subtitleText="About the application" titleText="About Cutrail" />
        <section className={panel}>
          <section className={hero}>
            <img className={icon} src={logoPath} alt="Cutrail" />
            <h1 className={title}>Cutrail</h1>
            <p className={subtitle}>
              An open-source desktop utility for clipping segments from longer videos.
            </p>
          </section>

          <section className={infoGrid}>
            <p className={infoLabel}>Version</p>
            <p className={infoValue}>{appMetadata.version}</p>
            <p className={infoLabel}>Copyright</p>
            <p className={infoValue}>{appMetadata.copyright}</p>
            <p className={infoLabel}>Attribution</p>
            <p className={infoValue}>{appMetadata.attribution}</p>
            <p className={infoLabel}>License</p>
            <p className={infoValue}>{appMetadata.license}</p>
          </section>

          <div className={linkRow}>
            <a className={link} href="https://github.com/sabinmarcu/cutrail" rel="noreferrer" target="_blank">
              Project page
            </a>
            <a
              className={link}
              href="https://github.com/sabinmarcu/cutrail/issues"
              rel="noreferrer"
              target="_blank"
            >
              Report an issue
            </a>
          </div>
        </section>
      </section>
    </main>
  );
};
