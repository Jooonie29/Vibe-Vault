import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultLoadingProps {
  message?: string;
  subMessage?: string;
  variant?: 'initialize' | 'post-auth';
  onAnimationComplete?: () => void;
  isLoading: boolean;
}

export function VaultLoading({ 
  message = 'Loading Vibe Vault...', 
  subMessage = 'Unlocking your creative assets',
  variant = 'initialize',
  onAnimationComplete,
  isLoading
}: VaultLoadingProps) {
  const [stage, setStage] = useState<'key-insert' | 'turning' | 'opening' | 'revealing' | 'complete'>('key-insert');
  const [shouldShow, setShouldShow] = useState(true);
  const hasCompleted = useRef(false);
  
  useEffect(() => {
    const timeline = [
      { stage: 'key-insert' as const, delay: 0 },
      { stage: 'turning' as const, delay: 1200 },
      { stage: 'opening' as const, delay: 3800 },
      { stage: 'revealing' as const, delay: 6000 },
      { stage: 'complete' as const, delay: 8000 },
    ];
    
    timeline.forEach(({ stage, delay }) => {
      setTimeout(() => {
        setStage(stage);
      }, delay);
    });
  }, []);

  useEffect(() => {
    if (stage === 'complete' && !hasCompleted.current) {
      hasCompleted.current = true;
      setTimeout(() => {
        setShouldShow(false);
        onAnimationComplete?.();
      }, 500);
    }
  }, [stage, onAnimationComplete]);

  const vaultSize = variant === 'post-auth' ? 140 : 120;
  const keySize = variant === 'post-auth' ? 36 : 32;

  if (!shouldShow && !isLoading) {
    return null;
  }

  return (
    <AnimatePresence>
      {(shouldShow || isLoading) && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center"
        >
          <div className="text-center">
            {/* Vault Container */}
            <div 
              className="relative mx-auto mb-8"
              style={{ width: vaultSize, height: vaultSize }}
            >
              {/* Vault Background */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 shadow-2xl border border-slate-200"
                initial={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}
                animate={{
                  boxShadow: stage === 'revealing' || stage === 'complete'
                    ? '0 25px 50px -12px rgba(139, 92, 246, 0.3)' 
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                }}
                transition={{ duration: 0.8 }}
              />
              
              {/* Vault Door */}
              <motion.div
                className="absolute inset-2 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 overflow-hidden origin-left border border-slate-300"
                style={{ transformOrigin: 'left center' }}
                animate={{
                  rotateY: stage === 'opening' || stage === 'revealing' || stage === 'complete' ? -85 : 0,
                }}
                transition={{ 
                  duration: 1.8, 
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {/* Door Details */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Circular Pattern */}
                  <div className="absolute w-16 h-16 rounded-full border-4 border-slate-400/40" />
                  <div className="absolute w-12 h-12 rounded-full border-2 border-slate-400/30" />
                  
                  {/* Keyhole */}
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-slate-700" />
                    <div className="w-2 h-3 bg-slate-700 mx-auto -mt-1" />
                  </div>
                </div>
                
                {/* Hinges */}
                <div className="absolute left-1 top-4 w-2 h-4 bg-slate-400 rounded-full" />
                <div className="absolute left-1 bottom-4 w-2 h-4 bg-slate-400 rounded-full" />
              </motion.div>
              
              {/* Key Animation */}
              <AnimatePresence>
                {stage !== 'revealing' && stage !== 'complete' && (
                  <motion.div
                    className="absolute z-20"
                    initial={{ x: -80, y: vaultSize / 2 - keySize / 2, opacity: 0, rotate: -45 }}
                    animate={{
                      x: stage === 'key-insert' || stage === 'turning' ? vaultSize / 2 - keySize / 2 : -80,
                      y: vaultSize / 2 - keySize / 2,
                      opacity: stage === 'key-insert' || stage === 'turning' ? 1 : 0,
                      rotate: stage === 'turning' ? 360 : -45,
                    }}
                    exit={{ x: -80, opacity: 0, rotate: -45 }}
                    transition={{ 
                      duration: stage === 'turning' ? 2 : 0.8,
                      ease: stage === 'turning' ? 'easeInOut' : 'easeOut'
                    }}
                  >
                    {/* Key Icon */}
                    <svg 
                      width={keySize} 
                      height={keySize} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-amber-600 drop-shadow-lg"
                    >
                      <circle cx="7.5" cy="15.5" r="5.5" />
                      <path d="m21 2-9.6 9.6" />
                      <path d="m15.5 7.5 3 3L22 7l-3-3" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Light Glow from Inside */}
              <motion.div
                className="absolute inset-4 rounded-xl"
                animate={{
                  background: stage === 'revealing' || stage === 'complete'
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)' 
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0) 0%, rgba(99, 102, 241, 0) 100%)'
                }}
                transition={{ duration: 1.2 }}
              />
              
              {/* Sparkles when opening */}
              <AnimatePresence>
                {(stage === 'revealing' || stage === 'complete') && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-violet-500"
                        initial={{ 
                          x: vaultSize / 2, 
                          y: vaultSize / 2, 
                          opacity: 1, 
                          scale: 0 
                        }}
                        animate={{ 
                          x: vaultSize / 2 + Math.cos(i * 45 * Math.PI / 180) * 55,
                          y: vaultSize / 2 + Math.sin(i * 45 * Math.PI / 180) * 55,
                          opacity: 0,
                          scale: 2
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, delay: i * 0.15 }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
            
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {message}
              </h2>
              <motion.p 
                className="text-gray-500"
                key={stage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {stage === 'key-insert' && 'Inserting key...'}
                {stage === 'turning' && 'Turning lock...'}
                {stage === 'opening' && 'Opening vault door...'}
                {(stage === 'revealing' || stage === 'complete') && subMessage}
              </motion.p>
            </motion.div>
            
            {/* Progress Bar */}
            <div className="mt-8 w-64 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                initial={{ width: '0%' }}
                animate={{ 
                  width: stage === 'key-insert' ? '20%' : 
                         stage === 'turning' ? '45%' : 
                         stage === 'opening' ? '70%' : 
                         stage === 'revealing' ? '90%' : '100%'
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VaultLoading;
