import type { ReactNode } from 'react';
import { WindowDecoration } from '@renderer/components/WindowDecoration';
import {
  actions,
  body,
  shell,
} from './UtilityWindow.css';

type UtilityWindowProps = {
  actionsSlot?: ReactNode;
  children: ReactNode;
  subtitleText: string;
  titleText: string;
};

export const UtilityWindow = ({
  actionsSlot, children, subtitleText, titleText,
}: UtilityWindowProps) => (
  <div className={shell}>
    <WindowDecoration subtitleText={subtitleText} titleText={titleText} />
    <main className={body}>
      {children}
      {actionsSlot ? <div className={actions}>{actionsSlot}</div> : null}
    </main>
  </div>
);
