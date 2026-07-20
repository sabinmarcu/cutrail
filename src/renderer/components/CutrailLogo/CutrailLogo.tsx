import type { ComponentPropsWithoutRef } from 'react';
import {
  glyph,
  root,
} from './CutrailLogo.css';

type CutrailLogoProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'>;

export const CutrailLogo = ({
  className,
  ...props
}: CutrailLogoProps) => {
  const classNames = className ? `${root} ${className}` : root;

  return (
    <span {...props} className={classNames}>
      <svg
        className={glyph}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <g stroke="currentColor" fill="none">
          <rect x="32" y="32" width="448" height="448" rx="72" strokeWidth="12" />
          <rect x="144" y="136" width="224" height="176" rx="24" strokeWidth="12" />
          <line x1="344" y1="136" x2="368" y2="160" strokeWidth="10" strokeLinecap="round" />
          <circle cx="176" cy="168" r="10" fill="currentColor" />
          <circle cx="208" cy="168" r="10" fill="currentColor" />
          <rect x="176" y="208" width="160" height="40" rx="10" strokeWidth="8" />
          <rect x="184" y="216" width="72" height="24" rx="6" fill="currentColor" />
          <rect x="264" y="216" width="64" height="24" rx="6" fill="currentColor" />
          <line x1="128" y1="336" x2="384" y2="336" strokeWidth="12" strokeLinecap="round" />
          <line x1="176" y1="324" x2="176" y2="348" strokeWidth="8" strokeLinecap="round" />
          <line x1="256" y1="324" x2="256" y2="348" strokeWidth="8" strokeLinecap="round" />
          <line x1="336" y1="324" x2="336" y2="348" strokeWidth="8" strokeLinecap="round" />
          <circle cx="256" cy="288" r="6" fill="currentColor" />
        </g>
      </svg>
    </span>
  );
};
