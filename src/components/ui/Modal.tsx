import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'custom';
  className?: string;
  showCloseButton?: boolean;
  noPadding?: boolean;
  bodyScroll?: boolean;
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-[95vw]',
  custom: '',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  showCloseButton = true,
  noPadding = false,
  bodyScroll = true
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className={cn(
              "relative w-full bg-card rounded-[32px] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border",
              sizes[size as keyof typeof sizes],
              className
            )}
          >
            {/* Header */}
            {(title || (showCloseButton && !noPadding)) && (
              <div className={cn(
                "flex items-start justify-between shrink-0",
                noPadding ? "absolute top-4 right-4 z-10 p-0" : "p-8 pb-0"
              )}>
                <div className="flex-1">
                  {title && (
                    <h3 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-2 text-base text-muted-foreground/80">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      "p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all duration-200",
                      noPadding && "bg-background/80 backdrop-blur-md shadow-sm border border-border"
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <div className={cn(
              "flex-1 flex flex-col min-h-0 h-full overflow-hidden",
              bodyScroll && "overflow-y-auto overscroll-contain",
              !noPadding && "p-8"
            )}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
