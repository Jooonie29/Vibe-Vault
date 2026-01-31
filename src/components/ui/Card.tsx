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
  const Component = hover || onClick ? motion.div : 'div';
  
  return (
    <Component
      onClick={onClick}
      whileHover={hover || onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        ${hover || onClick ? 'cursor-pointer transition-shadow hover:shadow-lg' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
