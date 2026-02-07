import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'glow';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variants = {
  default: 'bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-white/5',
  glass: 'glass dark:glass-dark',
  glow: 'bg-white dark:bg-slate-900 inner-glow border border-white/10 shadow-2xl',
};

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const isMotion = hover || onClick;
  const classes = `
        rounded-[2rem] overflow-hidden
        ${variants[variant]}
        ${isMotion ? 'cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-violet-500/20' : ''}
        ${paddings[padding]}
        ${className}
      `;

  if (isMotion) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        className={classes}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
}
