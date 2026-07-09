import { WindowDecoration } from '@renderer/components/WindowDecoration';
import {
  actions,
  body,
  shell,
} from './UtilityWindow.css';

export const UtilityWindow = ({
  actionsSlot, children, subtitleText, titleText,
}) => (
  <div className={shell}>
    <WindowDecoration subtitleText={subtitleText} titleText={titleText} />
    <main className={body}>
      {children}
      <div className={actions}>{actionsSlot}</div>
    </main>
  </div>
);
