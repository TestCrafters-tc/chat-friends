import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -24, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -24, x: '-50%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-5 left-1/2 z-50 flex items-center gap-3 px-4.5 py-3 rounded-full bg-[#1c1c1e]/90 text-white border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl pointer-events-none select-none max-w-[90vw] w-max"
          id="toast"
        >
          <div className="shrink-0 flex items-center justify-center">
            {type === 'success' && <CheckCircle2 size={16} className="text-[#30d158]" />}
            {type === 'error' && <AlertCircle size={16} className="text-[#ff453a]" />}
            {type === 'info' && <Info size={16} className="text-[#0A84FF]" />}
          </div>
          <span id="toastText" className="text-xs font-semibold leading-none tracking-wide text-white/95">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
