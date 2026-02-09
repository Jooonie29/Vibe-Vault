import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-white/80 dark:bg-zinc-900/80 border-emerald-200/50 dark:border-emerald-800/50',
  error: 'bg-white/80 dark:bg-zinc-900/80 border-red-200/50 dark:border-red-800/50',
  warning: 'bg-white/80 dark:bg-zinc-900/80 border-amber-200/50 dark:border-amber-800/50',
  info: 'bg-white/80 dark:bg-zinc-900/80 border-blue-200/50 dark:border-blue-800/50',
};

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const iconBgColors = {
  success: 'bg-emerald-500/10',
  error: 'bg-red-500/10',
  warning: 'bg-amber-500/10',
  info: 'bg-blue-500/10',
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              layout
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`
                pointer-events-auto
                flex items-center gap-4 p-4 rounded-2xl border shadow-xl shadow-black/5 min-w-[340px] max-w-md backdrop-blur-xl
                ${colors[toast.type]}
              `}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColors[toast.type]}`}>
                <Icon className={`w-5 h-5 ${iconColors[toast.type]}`} strokeWidth={2.5} />
              </div>
              
              <div className="flex-1 min-w-0 py-0.5">
                <p className="font-semibold text-sm text-foreground leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{toast.message}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-2 -mr-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
