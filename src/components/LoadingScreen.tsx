import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layers } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-[#0e1621] flex flex-col items-center justify-center p-6 select-none"
    >
      {/* Brand Badge with dynamic glow (no robot icon) */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: [0.97, 1.03, 0.97], opacity: 1 }}
        transition={{
          scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          opacity: { duration: 0.3 }
        }}
        className="relative mb-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#1c2733] border border-[#253241] flex items-center justify-center shadow-lg shadow-[#2481cc]/15">
          <Layers className="w-8 h-8 text-[#2aabee]" />
        </div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute -top-1.5 -right-1.5"
        >
          <Sparkles className="w-4 h-4 text-[#34c759]" />
        </motion.div>
      </motion.div>

      {/* Strong Typography Header */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-center space-y-1"
      >
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Raphael GIFs
        </h1>
        <p className="text-xs text-[#8293a4] font-medium">
          Carregando categorias e banco de GIFs...
        </p>
      </motion.div>

      {/* Animated Loading Bar */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 140, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mt-6 h-1 bg-[#16202c] rounded-full overflow-hidden w-[140px]"
      >
        <motion.div
          animate={{ x: [-140, 140] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          className="w-1/2 h-full bg-[#2481cc] rounded-full"
        />
      </motion.div>

      {/* Footer hint */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-8 text-[11px] text-[#708499] font-mono tracking-wide"
      >
        kaise.space • @raphaelsbot
      </motion.span>
    </motion.div>
  );
};
