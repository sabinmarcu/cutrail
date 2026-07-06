import logoPath from '@assets/logo-green.svg';
import '@renderer/windows/globalReset.css';
import { Button } from '@renderer/components/button';
import {
  logo,
  noDrag,
  page,
  shell,
  subtitle,
  title,
  content,
  footer,
} from './AppWindow.css';

export const AppWindow = () => (
    <main className={page}>
      <section className={shell}>
        <section className={content}>
          <img className={logo} src={logoPath} alt="Cutrail" />
          <h1 className={title}>Cutrail</h1>
          <p className={subtitle}>Open a source video to begin editing clips.</p>
          <Button
            type="button"
            variant="primary"
            className={noDrag}
            onClick={() => {
              void globalThis.cutrail?.openVideoEditor?.();
            }}
          >
            Select Video File
          </Button>
        </section>
        <footer className={footer}>
          <Button
            type="button"
            variant="secondary"
            className={noDrag}
            onClick={() => void globalThis.cutrail?.closeWindow?.()}
          >
            Close
          </Button>
        </footer>
      </section>
    </main>
);
