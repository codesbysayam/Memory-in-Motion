import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  className = '',
  children,
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'ghost'
      ? 'btn-ghost'
      : 'btn-secondary';

  return (
    <button className={`btn ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
