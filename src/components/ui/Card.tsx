import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
}: CardProps) {
  const isMotion = hover || onClick;
  const classes = `
        bg-white rounded-[2rem] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-transparent
        ${isMotion ? 'cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1' : ''}
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
