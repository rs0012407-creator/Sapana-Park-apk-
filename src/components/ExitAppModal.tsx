import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X, ShieldAlert } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';

interface ExitAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExitAppModal: React.FC<ExitAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleConfirmExit = () => {
    try {
      // If running inside Capacitor native Android app, exit app natively
      CapApp.exitApp();
    } catch {
      // Web fallback
      window.close();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-950/30">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-100">Exit Sapana Park App?</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            क्या आप ऐप बंद करना चाहते हैं? Your current session and offline data remain completely saved.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl transition active:scale-95"
            >
              Cancel (रहें)
            </button>

            <button
              onClick={handleConfirmExit}
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-950/40 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit App</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
