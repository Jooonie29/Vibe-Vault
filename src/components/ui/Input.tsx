import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isSearch?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, isSearch, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {(icon || isSearch) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {isSearch ? <Search className="w-5 h-5" /> : icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
              transition-all duration-200
              ${(icon || isSearch) ? 'pl-11' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'hover:border-gray-300 dark:hover:border-white/20'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
