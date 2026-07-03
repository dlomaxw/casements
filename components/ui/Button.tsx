import Link from 'next/link';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'ghost';
  href?: string; // renders as <Link> if provided
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-accent-500 text-brand-950 hover:bg-accent-400',
  outline: 'border border-brand-200 text-brand-900 hover:border-accent-500 hover:text-brand-700 dark:text-white',
  ghost: 'text-brand-700 hover:bg-brand-50',
};

export default function Button({
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  disabled,
  children,
  className = '',
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
