import React from 'react';
import { motion } from 'motion/react';
import { Building2, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[120] bg-slate-950 flex flex-col items-center justify-between p-8 text-center select-none"
    >
      <div className="w-full flex justify-end pt-safe">
        <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reg: HSG-(G)-452 / Goa</span>
        </span>
      </div>

      <div className="flex flex-col items-center my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <Building2 className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute -top-1 -right-1 text-emerald-300"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight"
        >
          Sapana Park
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wider uppercase mt-1"
        >
          Co-operative Housing Society Ltd.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.4 }}
          className="text-[11px] text-slate-400 mt-2 max-w-xs"
        >
          Porvorim, Goa • Smart Resident & Society Management
        </motion.p>

        {/* Loading bar animation */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-8">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          />
        </div>
      </div>

      <div className="pb-safe text-[10px] text-slate-500 font-medium">
        v1.0.0 • Mobile App Engine • Secure Encryption Active
      </div>
    </motion.div>
  );
};
