import logoPath from '@assets/logo-green.svg';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/Button';
import { WindowDecoration } from '@renderer/components/WindowDecoration';
import {
  footer,
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

export const AboutWindow = () => (
  <main className={page}>
    <section className={shell}>
      <WindowDecoration subtitleText="About the application" titleText="About Cutrail" />
      <section className={panel}>
        <section className={hero}>
          <img className={icon} src={logoPath} alt="Cutrail" />
          <h1 className={title}>Cutrail</h1>
          <p className={subtitle}>An open-source desktop utility for clipping segments from longer videos.</p>
        </section>
        <div className={linkRow}>
          <a className={link} href="https://github.com/sabinmarcu/cutrail" rel="noreferrer" target="_blank">
            Project page
          </a>
          <a className={link} href="https://github.com/sabinmarcu/cutrail/issues" rel="noreferrer" target="_blank">
            Report an issue
          </a>
        </div>
      </section>
      <footer className={footer}>
        <Button type="button" variant="secondary" onClick={() => void globalThis.cutrail?.closeWindow?.()}>
          Close
        </Button>
      </footer>
    </section>
  </main>
);
