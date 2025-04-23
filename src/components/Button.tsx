import { ReactNode, MouseEvent } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`button ${variant === 'primary' ? 'button-primary' : 'button-secondary'} ${disabled ? 'disabled' : ''} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}