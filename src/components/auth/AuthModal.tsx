import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export function AuthModal() {
  const { activeModal, closeModal, modalData } = useUIStore();
  const { postAuthLoading } = useAuthStore();
  const [view, setView] = useState<'login' | 'register'>('login');

  const isOpen = activeModal === 'auth' && !postAuthLoading;

  useEffect(() => {
    if (!isOpen) return;
    const nextView = modalData?.view;
    if (nextView === 'login' || nextView === 'register') {
      setView(nextView);
    }
  }, [isOpen, modalData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-transparent rounded-3xl overflow-hidden flex flex-col items-center justify-center"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            {view === 'login' ? (
              <SignIn
                routing="hash"
                
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "bg-white border-none shadow-none",
                  }
                }}
              />
            ) : (
              <SignUp
                routing="hash"
                
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "bg-white border-none shadow-none",
                  }
                }}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
