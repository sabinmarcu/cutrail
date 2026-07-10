import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { button } from './Button.css';

type ButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  children, className = '', variant = 'primary', ...props
}: ButtonProps) => {
  const classes = [button({ variant }), className].filter((value) => value.length > 0).join(' ');

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
};
