import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none px-4 animate-fadeIn">
      <div className="bg-[#1c2733]/95 backdrop-blur-md text-white text-xs font-medium px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xl ring-1 ring-white/10 max-w-xs truncate">
        <div className="w-4 h-4 rounded-full bg-[#34c759] flex items-center justify-center flex-shrink-0">
          <Check className="w-2.5 h-2.5 text-[#0e1621] stroke-[3]" />
        </div>
        <span className="truncate">{message}</span>
      </div>
    </div>
  );
};
