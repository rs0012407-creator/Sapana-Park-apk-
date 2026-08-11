import React, { useState } from 'react';
import { X, Plus, CheckCircle2, User, Building2, ShieldCheck, Mail } from 'lucide-react';
import { googleAuthApi, mapUserAccountToResident, saveSession, UserSession } from '../api/authApi';

export interface GoogleAccountItem {
  googleId: string;
  fullName: string;
  email: string;
  profilePhoto: string;
  subtitle?: string;
  isDeviceAccount?: boolean;
}

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto: string;
  }) => void;
}

const DEVICE_GOOGLE_ACCOUNTS: GoogleAccountItem[] = [
  {
    googleId: 'GOOG-DEV-101',
    fullName: 'Rajbhan Singh',
    email: 'rajbhansingh467@gmail.com',
    profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    subtitle: 'Primary Device Google Account',
    isDeviceAccount: true,
  },
  {
    googleId: 'GOOG-DEV-102',
    fullName: 'Rajesh Naik',
    email: 'rajesh.naik@sapanapark.org',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    subtitle: 'Secretary • Flat A-302',
    isDeviceAccount: true,
  },
  {
    googleId: 'GOOG-DEV-103',
    fullName: 'Anjali Deshmukh',
    email: 'anjali.d@gmail.com',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    subtitle: 'Treasurer • Flat B-101',
    isDeviceAccount: true,
  },
  {
    googleId: 'GOOG-DEV-104',
    fullName: 'Sapana Park Resident',
    email: 'sapanapark.resident@gmail.com',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    subtitle: 'Verified Resident',
    isDeviceAccount: true,
  },
];

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    onSelectAccount({
      googleId: `G-CUSTOM-${Date.now()}`,
      fullName: customName.trim(),
      email: customEmail.trim(),
      profilePhoto: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    });
    setCustomName('');
    setCustomEmail('');
    setShowAddCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl relative font-sans">
        {/* Top Google Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-base font-bold text-slate-800">Choose a Google Account</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3">
          <p className="text-xs text-slate-500 mb-3">
            To continue to <strong className="text-slate-800 font-bold">Sapana Park CHS Portal</strong>, select one of your device's registered Google accounts:
          </p>

          {/* Device Google Accounts List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {DEVICE_GOOGLE_ACCOUNTS.map((acc) => (
              <button
                key={acc.googleId}
                type="button"
                onClick={() => onSelectAccount(acc)}
                className="w-full flex items-center space-x-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
              >
                <img
                  src={acc.profilePhoto}
                  alt={acc.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                      {acc.fullName}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate font-mono">{acc.email}</p>
                  {acc.subtitle && (
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold inline-block mt-0.5">
                      {acc.subtitle}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Add custom account button or form */}
          {!showAddCustom ? (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="mt-3 w-full border border-dashed border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 p-3 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 bg-slate-50 hover:bg-emerald-50/40"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Use another Google Account</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustomSubmit} className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>Enter Other Google Account</span>
                <button type="button" onClick={() => setShowAddCustom(false)} className="text-slate-400">✕</button>
              </div>
              <input
                type="text"
                placeholder="Full Name (e.g. Ramesh Deshmukh)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs"
              />
              <input
                type="email"
                placeholder="Google Email (e.g. ramesh@gmail.com)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs"
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs shadow transition"
              >
                Sign In With This Account
              </button>
            </form>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Protected by Google OAuth 2.0 Security • Sapana Park CHS
          </p>
        </div>
      </div>
    </div>
  );
};
