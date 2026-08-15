import React from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-[#0e1621] flex flex-col items-center justify-center p-6 select-none"
    >
      {/* Bot Icon with glowing pulse */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
        transition={{
          scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          opacity: { duration: 0.3 }
        }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-[#1c2733] border border-[#253241] flex items-center justify-center shadow-lg shadow-[#2481cc]/10">
          <Bot className="w-10 h-10 text-[#2aabee]" />
        </div>
        
        {/* Little decorative accent spark */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-5 h-5 text-[#34c759]" />
        </motion.div>
      </motion.div>

      {/* Brand title */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-center space-y-1.5"
      >
        <h1 className="text-xl font-bold text-white tracking-tight">
          Raphael Bot
        </h1>
        <p className="text-xs text-[#8293a4] font-medium">
          Carregando comandos & API de GIFs...
        </p>
      </motion.div>

      {/* Animated Loading Bar */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 140, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-6 h-1.5 bg-[#16202c] rounded-full overflow-hidden w-[140px]"
      >
        <motion.div
          animate={{ x: [-140, 140] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="w-1/2 h-full bg-[#2481cc] rounded-full"
        />
      </motion.div>

      {/* Footer hint */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-8 text-[11px] text-[#708499] font-mono"
      >
        @raphaelsbot • kaise.space
      </motion.span>
    </motion.div>
  );
};
