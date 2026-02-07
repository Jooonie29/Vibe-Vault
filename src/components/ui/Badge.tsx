import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  color?: string;
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-violet-100 text-violet-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  secondary: 'bg-slate-100 text-slate-700',
  outline: 'border border-gray-200 text-gray-600 bg-white',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  color,
  className = ''
}: BadgeProps) {
  const style = color ? { backgroundColor: `${color}20`, color } : undefined;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${!color ? variants[variant] : ''}
        ${sizes[size]}
        ${className}
      `}
      style={style}
    >
      {children}
    </span>
  );
}
