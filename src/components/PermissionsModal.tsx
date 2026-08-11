import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { DevicePermissionsScreen } from './DevicePermissionsScreen';

interface PermissionsModalProps {
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl my-auto p-5 sm:p-6 shadow-2xl relative text-slate-100 space-y-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">App & Device Permissions Controls</h2>
              <p className="text-xs text-slate-400">Manage Camera, Internet, Gallery & Document Access</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          <DevicePermissionsScreen />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">100% On-Demand Access • No Background Tracking</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition shadow"
          >
            Done / पूर्ण
          </button>
        </div>
      </div>
    </div>
  );
};
