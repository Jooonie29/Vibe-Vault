import React from 'react';
import { motion } from 'framer-motion';

interface RefreshLoadingProps {
  message?: string;
}

export function RefreshLoading({ message = 'Refreshing...' }: RefreshLoadingProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Vault Lock Animation */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-4 border-slate-200"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          
          {/* Inner vault icon */}
          <motion.div
            className="absolute inset-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"
            animate={{
              rotate: [0, -360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Keyhole / Lock symbol */}
            <div className="relative">
              <motion.div
                className="w-6 h-6 rounded-full border-4 border-violet-500"
                animate={{
                  borderColor: ['#8b5cf6', '#6366f1', '#8b5cf6'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-3 bg-violet-500"
                style={{ borderRadius: '0 0 4px 4px' }}
                animate={{
                  backgroundColor: ['#8b5cf6', '#6366f1', '#8b5cf6'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
          
          {/* Orbiting dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-violet-400"
              style={{
                top: '50%',
                left: '50%',
                marginTop: -4,
                marginLeft: -4,
              }}
              animate={{
                x: [0, Math.cos(i * 2.09) * 35, 0],
                y: [0, Math.sin(i * 2.09) * 35, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {message}
          </h2>
          <motion.p 
            className="text-gray-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Syncing your vault...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default RefreshLoading;
