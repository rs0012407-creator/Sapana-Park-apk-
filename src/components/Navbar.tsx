import React from 'react';
import { Building2, ShieldCheck, UserCheck, Search, Bell, Sparkles, Wifi, WifiOff, Siren, Sliders, User, Settings, LogIn } from 'lucide-react';
import { UserSession } from '../api/authApi';
import { useOnlineStatus } from '../utils/offlineStorage';

interface NavbarProps {
  session: UserSession;
  onSwitchRole: (role: 'Resident' | 'Secretary') => void;
  onOpenAIHelp: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenPermissions: () => void;
  onOpenEmergency: () => void;
  onOpenAuth?: () => void;
  activeScreen: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onSwitchRole,
  onOpenAIHelp,
  onOpenProfile,
  onOpenSettings,
  onOpenPermissions,
  onOpenEmergency,
  onOpenAuth,
  activeScreen,
}) => {
  const { isOnline } = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Crest */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-slate-100">
                  Sapana Park <span className="text-emerald-400 font-extrabold">CHS</span>
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-800/60 hidden sm:inline-block">
                  Goa Regd. 452
                </span>
                {/* Network Status Badge */}
                <span
                  className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    isOnline
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                  }`}
                  title={isOnline ? 'Online - Connected to Sapana Park Cloud' : 'Offline - Loaded from Cached Local Storage'}
                >
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span className="hidden md:inline">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-400" />
                      <span>Offline (Cached)</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Porvorim, Bardez • {session.resident.flatNumber} ({session.resident.name.split(' ')[0]})
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Emergency Contacts Siren Button */}
            <button
              onClick={onOpenEmergency}
              className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 p-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 animate-pulse"
              title="Emergency SOS & Guard Helplines"
            >
              <Siren className="w-4 h-4 text-rose-400" />
              <span className="hidden lg:inline text-[11px]">Emergency</span>
            </button>

            {/* Device Permissions Button */}
            <button
              onClick={onOpenPermissions}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2 rounded-xl text-xs transition"
              title="Camera, Gallery, Location, SMS & Notification Permissions"
            >
              <Sliders className="w-4 h-4 text-sky-400" />
            </button>

            {/* Role Switcher Pill */}
            <button
              onClick={() => onSwitchRole(session.role === 'Resident' ? 'Secretary' : 'Resident')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                session.role === 'Secretary' || session.role === 'Treasurer'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle between Resident view and Managing Committee view"
            >
              {session.role === 'Secretary' || session.role === 'Treasurer' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Committee View</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Resident View</span>
                </>
              )}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIHelp}
              className="flex items-center space-x-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2 rounded-xl text-xs transition"
              title="Open Account & App Settings"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Profile or Login/Register Button */}
            {!session.isLoggedIn ? (
              <button
                onClick={onOpenAuth}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 animate-pulse"
                title="Register or Log In to Colony Account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Register / Login</span>
              </button>
            ) : (
              <button
                onClick={onOpenProfile}
                className="bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1"
                title="Open Profile & Verification Documents"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{session.resident.flatNumber}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
