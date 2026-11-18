import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'tertiary';

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
      : variant === 'ghost' || variant === 'tertiary'
      ? 'btn-tertiary'
      : 'btn-secondary';

  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
